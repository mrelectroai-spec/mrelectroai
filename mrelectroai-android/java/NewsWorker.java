package com.mrelectroai.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * بيفحص ملف الأخبار عالموقع (app/news.json) كل شوي، وأي خبر جديد بيطلع إشعار.
 * ما في Firebase: الخبر بينزل من GitHub وبس.
 */
public class NewsWorker extends Worker {
    static final String FEED = "https://mrelectroai-spec.github.io/mrelectroai/app/news.json";
    static final String HOME = "https://mrelectroai-spec.github.io/mrelectroai/app/";
    static final String CH = "news";

    public NewsWorker(@NonNull Context c, @NonNull WorkerParameters p) { super(c, p); }

    public static void schedule(Context c) {
        Constraints k = new Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build();
        WorkManager wm = WorkManager.getInstance(c);
        wm.enqueueUniquePeriodicWork("news", ExistingPeriodicWorkPolicy.KEEP,
                new PeriodicWorkRequest.Builder(NewsWorker.class, 15, TimeUnit.MINUTES).setConstraints(k).build());
        wm.enqueueUniqueWork("news-now", ExistingWorkPolicy.REPLACE,
                new OneTimeWorkRequest.Builder(NewsWorker.class).setConstraints(k).build());
    }

    @NonNull @Override
    public Result doWork() {
        try {
            HttpURLConnection h = (HttpURLConnection) new URL(FEED + "?t=" + System.currentTimeMillis()).openConnection();
            h.setConnectTimeout(15000);
            h.setReadTimeout(15000);
            h.setUseCaches(false);
            if (h.getResponseCode() != 200) return Result.success();
            StringBuilder sb = new StringBuilder();
            BufferedReader r = new BufferedReader(new InputStreamReader(h.getInputStream(), "UTF-8"));
            String line;
            while ((line = r.readLine()) != null) sb.append(line).append('\n');
            r.close();
            JSONArray items = new JSONObject(sb.toString()).optJSONArray("items");
            if (items == null) return Result.success();

            SharedPreferences sp = getApplicationContext().getSharedPreferences("news", Context.MODE_PRIVATE);
            Set<String> seen = new HashSet<>(sp.getStringSet("seen", new HashSet<>()));
            boolean first = !sp.getBoolean("init", false);
            int shown = 0;
            for (int i = 0; i < items.length(); i++) {
                JSONObject it = items.optJSONObject(i);
                if (it == null) continue;
                String id = it.optString("id", "");
                if (id.isEmpty() || seen.contains(id)) continue;
                seen.add(id);
                // أول مرة بعد التثبيت: ما منطلّع الأخبار القديمة، بس الأحدث إذا كان مكتوب "new"
                if (first) continue;
                if (!it.optBoolean("notify", true)) continue;
                if (shown < 3) { show(it, id); shown++; }
            }
            sp.edit().putStringSet("seen", seen).putBoolean("init", true).apply();
        } catch (Exception e) {
            return Result.retry();
        }
        return Result.success();
    }

    private void show(JSONObject it, String id) {
        Context c = getApplicationContext();
        if (Build.VERSION.SDK_INT >= 33 &&
                ContextCompat.checkSelfPermission(c, "android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) return;
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CH, "الأخبار والجديد", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("أخبار MrElectroAI: كورسات، أدوات، عروض");
            nm.createNotificationChannel(ch);
        }
        String url = it.optString("url", "");
        if (url.isEmpty()) url = HOME + "#news";
        Intent open = new Intent(c, MainActivity.class);
        open.putExtra("open", url);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(c, id.hashCode(), open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String title = it.optString("title", "MrElectroAI");
        String body = it.optString("body", "");
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CH)
                .setSmallIcon(R.drawable.ic_stat_bolt)
                .setColor(0xFF22C79B)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pi);
        nm.notify(id.hashCode(), b.build());
    }
}
