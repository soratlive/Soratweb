package com.sorat.game

import android.annotation.SuppressLint
import android.webkit.CookieManager
import android.webkit.WebSettings
import android.webkit.WebView

object WebViewManager {

    @SuppressLint("SetJavaScriptEnabled")
    fun configureWebView(webView: WebView) {
        val settings: WebSettings = webView.settings
        
        // JavaScript & DOM Storage
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        
        // Caching & Performance
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.setNeedInitialFocus(true)
        
        // File & Security settings
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        
        // Cookies Configuration
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)
        
        // Zoom & Responsive
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.builtInZoomControls = false
        settings.displayZoomControls = false
    }
}
