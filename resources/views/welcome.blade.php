<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Retail Inventory System (RIS)</title>
    <meta name="description" content="A comprehensive Retail Inventory System for managing branches, stock, sales, and employees.">
    @php
        $isLocal = app()->environment('local');
        $manifestPath = public_path('build/manifest.json');
        $manifest = [];
        if (!$isLocal && file_exists($manifestPath)) {
            $manifest = json_decode(file_get_contents($manifestPath), true);
        }
    @endphp

    @if($isLocal)
        {{-- React Refresh Preamble (required by @vitejs/plugin-react) --}}
        <script type="module">
            import RefreshRuntime from 'http://127.0.0.1:5173/@react-refresh'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
        </script>
        {{-- Vite Dev Server --}}
        <script type="module" src="http://127.0.0.1:5173/@vite/client"></script>
        <link rel="stylesheet" href="http://127.0.0.1:5173/resources/js/src/index.css">
        <script type="module" src="http://127.0.0.1:5173/resources/js/app.jsx"></script>
    @else
        @if(isset($manifest['resources/js/src/index.css']['file']))
            <link rel="stylesheet" href="/build/{{ $manifest['resources/js/src/index.css']['file'] }}">
        @endif
        @if(isset($manifest['resources/js/app.jsx']['file']))
            <script type="module" src="/build/{{ $manifest['resources/js/app.jsx']['file'] }}"></script>
        @endif
    @endif
</head>
<body class="bg-slate-50 antialiased font-sans text-slate-900">
    <div id="root"></div>
</body>
</html>
