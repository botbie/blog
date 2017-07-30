#!/bin/bash
echo "Started deploying"

cd ../
git clone $ORIGIN_URL deployment
cd deployment

# Delete and move files.
find . -maxdepth 1 ! -name '.' ! -name '..' ! -name '.git' ! -name '.gitignore' -exec rm -rf {} \;
mv ../blog/_site/* .

# Push to gh-pages.
git config user.name "$USER_NAME"
git config user.email "$USER_EMAIL"

git add -fA
git commit --allow-empty -m "Deploy Botbie Blog"
git push -f $ORIGIN_URL

echo "Deployed Successfully!"

exit 0
