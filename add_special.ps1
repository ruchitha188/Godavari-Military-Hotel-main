$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    if ($file.Name -in @('index.html', 'menu.html', 'about-us.html', 'gallery.html', 'contact.html')) {
        $content = [IO.File]::ReadAllText($file.FullName)
        
        # Add Special Menu
        if (-not $content.Contains('menu.html#special')) {
            $content = $content.Replace('<li><a href="menu.html">Full Menu</a></li>', "<li><a href=`"menu.html`">Full Menu</a></li>`n          <li><a href=`"menu.html#special`">Special Menu ✨</a></li>")
        }

        [IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
    }
}
