package com.mrelectroai.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** إعدادات التطبيق من صفحة الإعدادات: تشغيل/تسكير الإشعارات، رقم النسخة، إعدادات التلفون. */
@CapacitorPlugin(name = "AppPrefs")
public class AppPrefs extends Plugin {

    static boolean notifOn(Context c) {
        return c.getSharedPreferences("news", Context.MODE_PRIVATE).getBoolean("on", true);
    }

    @PluginMethod
    public void get(PluginCall call) {
        Context c = getContext();
        JSObject r = new JSObject();
        r.put("notif", notifOn(c));
        r.put("system", NotificationManagerCompat.from(c).areNotificationsEnabled());
        String v = "";
        try { v = c.getPackageManager().getPackageInfo(c.getPackageName(), 0).versionName; } catch (Exception ignored) { }
        r.put("version", v);
        call.resolve(r);
    }

    @PluginMethod
    public void setNotif(PluginCall call) {
        Context c = getContext();
        boolean on = Boolean.TRUE.equals(call.getBoolean("on", true));
        SharedPreferences sp = c.getSharedPreferences("news", Context.MODE_PRIVATE);
        sp.edit().putBoolean("on", on).apply();
        if (on) {
            NewsWorker.schedule(c);
            if (Build.VERSION.SDK_INT >= 33 && getActivity() != null &&
                    getActivity().checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                getActivity().requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 72);
            }
        }
        JSObject r = new JSObject();
        r.put("notif", on);
        r.put("system", NotificationManagerCompat.from(c).areNotificationsEnabled());
        call.resolve(r);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        Context c = getContext();
        Intent i;
        if (Build.VERSION.SDK_INT >= 26) {
            i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, c.getPackageName());
        } else {
            i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + c.getPackageName()));
        }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try { c.startActivity(i); } catch (Exception ignored) { }
        call.resolve();
    }
}
