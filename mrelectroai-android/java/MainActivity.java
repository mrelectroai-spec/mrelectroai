package com.mrelectroai.app;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    static final String HOST = "mrelectroai-spec.github.io";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppPrefs.class);
        super.onCreate(savedInstanceState);
        try {
            getWindow().getDecorView().setBackgroundColor(0xFF070F0D);
            getWindow().setStatusBarColor(0xFF070F0D);
            getWindow().setNavigationBarColor(0xFF070F0D);
        } catch (Exception ignored) { }

        // إذن الإشعارات (أندرويد 13 وطالع)
        if (AppPrefs.notifOn(this) && Build.VERSION.SDK_INT >= 33 &&
                checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 71);
        }
        NewsWorker.schedule(this);

        WebView wv = getBridge().getWebView();
        // الكيبورد: منرفع الصفحة فوقو (مع edge-to-edge أندرويد ما بيصغّر الصفحة لحالو، فكان الكيبورد يغطّي خانة الكتابة)
        ViewCompat.setOnApplyWindowInsetsListener(wv, (v, ins) -> {
            Insets sys = ins.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = ins.getInsets(WindowInsetsCompat.Type.ime());
            ViewGroup.MarginLayoutParams lp = (ViewGroup.MarginLayoutParams) v.getLayoutParams();
            lp.leftMargin = sys.left; lp.rightMargin = sys.right; lp.topMargin = sys.top;
            lp.bottomMargin = Math.max(sys.bottom, ime.bottom);
            v.setLayoutParams(lp);
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(wv);
        // ملفات PDF وغيرها: بتنفتح برّا التطبيق لتنزل عالتلفون
        wv.setDownloadListener((url, ua, cd, mime, len) -> openOutside(url));
        handle(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handle(intent);
    }

    private void handle(Intent i) {
        if (i == null) return;
        final String u = i.getStringExtra("open");
        if (u == null || u.isEmpty()) return;
        i.removeExtra("open");
        Uri p = Uri.parse(u);
        if (p.getHost() != null && !HOST.equals(p.getHost())) { openOutside(u); return; }
        final WebView wv = getBridge().getWebView();
        wv.postDelayed(() -> wv.loadUrl(u), 400);
    }

    private void openOutside(String url) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) { }
    }
}
