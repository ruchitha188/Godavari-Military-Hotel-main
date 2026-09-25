$files = Get-ChildItem -Filter *.html
foreach ($file in $files) {
    if ($file.Name -in @('index.html', 'menu.html', 'about-us.html', 'gallery.html', 'contact.html', 'admin.html', 'login.html')) {
        $content = [IO.File]::ReadAllText($file.FullName)
        $newContent = [Text.RegularExpressions.Regex]::Replace($content, '(?s)<!-- ACCOUNT DROPDOWN -->.*?</li\>', '<li><a href="login.html" class="nav-cta nav-login-link">Admin Login</a></li>')
        if ($file.Name -eq 'index.html') {
            $newContent = [Text.RegularExpressions.Regex]::Replace($newContent, '<li><a href="login.html" class="nav-login-link">Member Login</a></li>', '')
        }
        [IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Updated $($file.Name)"
    }
}
