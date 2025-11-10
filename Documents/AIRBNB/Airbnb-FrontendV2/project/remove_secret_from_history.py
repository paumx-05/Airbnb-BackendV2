#!/usr/bin/env python3
"""
Script para eliminar el secreto de Stripe del historial de Git
"""
import subprocess
import sys
import os

SECRET_KEY = "sk_test_your_stripe_secret_key_here"
REPLACEMENT = "sk_test_your_stripe_secret_key_here"
FILE_PATH = "Documents/AIRBNB/Airbnb-FrontendV2/project/BACKEND-STRIPE-INTEGRATION-GUIDE.md"

def main():
    # Cambiar al directorio raíz del repositorio
    repo_root = subprocess.check_output(['git', 'rev-parse', '--show-toplevel']).decode().strip()
    os.chdir(repo_root)
    
    print(f"Repositorio raíz: {repo_root}")
    print("Ejecutando git filter-branch para eliminar el secreto del historial...")
    
    # Ejecutar git filter-branch
    env = os.environ.copy()
    env['FILTER_BRANCH_SQUELCH_WARNING'] = '1'
    
    cmd = [
        'git', 'filter-branch', '-f',
        '--tree-filter',
        f"if [ -f '{FILE_PATH}' ]; then sed -i 's|{SECRET_KEY}|{REPLACEMENT}|g' '{FILE_PATH}'; fi",
        '--prune-empty',
        '--tag-name-filter', 'cat',
        '--', '--all'
    ]
    
    try:
        result = subprocess.run(cmd, env=env, check=True, capture_output=True, text=True)
        print("✅ Historial reescrito exitosamente")
        print("\nAhora ejecuta: git push --force")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e.stderr}")
        return 1

if __name__ == '__main__':
    sys.exit(main())


