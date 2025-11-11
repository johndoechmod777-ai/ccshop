import os

print("🔍 BUSCANDO ARCHIVOS QUE USAN FIREBASE...")

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
firebase_keywords = ['firebase', 'Firestore', 'Authentication', 'database', 'auth']

needs_app_check = []

for file in html_files:
    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        if any(keyword in content for keyword in firebase_keywords):
            needs_app_check.append(file)
            print(f"   ✅ {file}: NECESITA App Check")
        else:
            print(f"   ❌ {file}: NO necesita App Check")

print(f"\\n🎯 TOTAL: {len(needs_app_check)} archivos necesitan App Check")

