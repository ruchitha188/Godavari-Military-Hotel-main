$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    if ($file.Name -in @('index.html', 'menu.html', 'about-us.html', 'gallery.html', 'contact.html', 'admin.html', 'login.html')) {
        $content = [IO.File]::ReadAllText($file.FullName)
        
        $content = [Text.RegularExpressions.Regex]::Replace($content, '\s*<li><a href="login\.html" class="nav-cta nav-login-link">Admin Login</a></li>', '')
        $content = [Text.RegularExpressions.Regex]::Replace($content, '\s*<li><a href="admin\.html" class="nav-cta active">.*?Admin</a></li>', '')
        
        if (-not $content.Contains('<li><a href="login.html">Admin Login</a></li>')) {
            $content = $content.Replace('<li><a href="contact.html">Contact Us</a></li>', "<li><a href=`"contact.html`">Contact Us</a></li>`n          <li><a href=`"login.html`">Admin Login</a></li>")
        }
        
        [IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $($file.Name)"
    }
}
