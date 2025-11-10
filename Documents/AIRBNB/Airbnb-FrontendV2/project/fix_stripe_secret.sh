#!/bin/bash
# Script para eliminar el secreto de Stripe del historial de Git

SECRET_KEY="sk_test_your_stripe_secret_key_here"
REPLACEMENT="sk_test_your_stripe_secret_key_here"
FILE_PATH="Documents/AIRBNB/Airbnb-FrontendV2/project/BACKEND-STRIPE-INTEGRATION-GUIDE.md"

export FILTER_BRANCH_SQUELCH_WARNING=1

git filter-branch -f --tree-filter "
if [ -f '$FILE_PATH' ]; then
  sed -i 's|$SECRET_KEY|$REPLACEMENT|g' '$FILE_PATH'
fi
" --prune-empty --tag-name-filter cat -- --all


