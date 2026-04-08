import os

def review():
    files = [
        'src/lib/auth.ts',
        'src/lib/api.ts',
        'src/lib/utils.ts',
        'src/lib/stores/user.svelte.ts',
        'src/lib/stores/theme.svelte.ts',
        'src/lib/stores/sidebar.svelte.ts',
        'src/lib/components/TabView.svelte',
        'src/lib/components/MolCard.svelte',
        'src/lib/components/FileView.svelte',
        'src/lib/components/AppBar.svelte',
        'src/routes/+layout.svelte',
        'src/routes/+page.svelte',
        'src/routes/settings/+page.svelte',
        'src/routes/auth/login/+page.svelte',
        'src/routes/auth/register/+page.svelte',
        'src/routes/me/+page.svelte',
        'src/routes/mol/[name]/+page.svelte',
        'svelte.config.js'
    ]

    for f in files:
        if os.path.exists(f):
            print(f"--- Reviewing {f} ---")
            with open(f, 'r') as file:
                print(file.read()[:500] + "...")
        else:
            print(f"!!! File {f} missing !!!")

if __name__ == "__main__":
    review()
