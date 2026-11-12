package com.mrelectroai.app;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONObject;

import java.util.Map;

/**
 * الإشعار الفوري (Firebase): أنور بيبعت من وضع الأستاذ، وبيوصل دغري لكل التلفونات.
 * إذا الإشعار وصل من هون، الفحص الدوري (NewsWorker) ما بيعيدو.
 */
public class PushService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage msg) {
        try {
            Map<String, String> d = msg.getData();
            String id = d.get("id");
            if (id == null || id.isEmpty()) id = "push-" + System.currentTimeMillis();
            if (!NewsWorker.markNew(getApplicationContext(), id)) return;
            JSONObject it = new JSONObject();
            String title = d.get("title");
            if (title == null && msg.getNotification() != null) title = msg.getNotification().getTitle();
            String body = d.get("body");
            if (body == null && msg.getNotification() != null) body = msg.getNotification().getBody();
            it.put("title", title == null ? "MrElectroAI" : title);
            it.put("body", body == null ? "" : body);
            it.put("url", d.get("url") == null ? "" : d.get("url"));
            NewsWorker.notify(getApplicationContext(), it, id);
        } catch (Exception ignored) { }
    }

    @Override
    public void onNewToken(String token) {
        try { com.google.firebase.messaging.FirebaseMessaging.getInstance().subscribeToTopic("all"); } catch (Exception ignored) { }
    }
}
