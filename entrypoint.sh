#!/bin/sh

# Gera o arquivo .env a partir das variáveis do ambiente
echo "Gerando arquivo .env a partir das variáveis do ambiente..."
echo "VITE_ENV=$VITE_ENV" > .env
echo "VITE_IMAGE_VERSION=$VITE_IMAGE_VERSION" >> .env
echo "VITE_URL_DOTCORE=$VITE_URL_DOTCORE" >> .env
echo "VITE_AES_KEY=$VITE_AES_KEY" >> .env
echo "VITE_AES_IV=$VITE_AES_IV" >> .env
echo "VITE_ENTERPRISE_NAME=$VITE_ENTERPRISE_NAME" >> .env
echo "VITE_THEME_BLOBS_PATH=$VITE_THEME_BLOBS_PATH" >> .env
echo "VITE_THEME_FILENAME=$VITE_THEME_FILENAME" >> .env
echo "VITE_COMMUNICATIONHUB_URL=$VITE_COMMUNICATIONHUB_URL" >> .env
echo "VITE_TRANSLATE_URL=$VITE_TRANSLATE_URL" >> .env

echo ".env gerado com sucesso:"
cat .env