// android/app/src/main/java/com/meresimistudios/htn/MainActivity.java
// MereSimi Studios Ltd — Honiara Taxi Network

package com.meresimistudios.htn;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register Capacitor plugins
        registerPlugin(com.getcapacitor.plugin.WebViewPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
