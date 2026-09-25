$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    if ($file.Name -in @('index.html', 'menu.html', 'about-us.html', 'gallery.html', 'contact.html', 'admin.html', 'login.html')) {
        $content = [IO.File]::ReadAllText($file.FullName)
        
        if (-not $content.Contains('manifest.json')) {
            $injection = "  <link rel=`"manifest`" href=`"manifest.json`">`n  <meta name=`"theme-color`" content=`"#c9a84c`">`n</head>"
            $content = $content.Replace("</head>", $injection)
            [IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            Write-Host "Injected PWA tags into $($file.Name)"
        }
    }
}
