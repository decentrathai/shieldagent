#!/bin/bash
# ShieldAgent Azure Deployment Script

set -e

echo "====================================="
echo "ShieldAgent Azure Deployment"
echo "====================================="

# Configuration
RESOURCE_GROUP="shieldagent-rg"
LOCATION="eastus"
APP_NAME="shieldagent"
ENVIRONMENT="prod"

# Check Azure CLI
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed"
    exit 1
fi

# Login check
echo "Checking Azure login..."
az account show > /dev/null 2>&1 || {
    echo "Please login to Azure:"
    az login
}

# Create resource group
echo "Creating resource group..."
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION

# Deploy infrastructure using Bicep
echo "Deploying infrastructure..."
az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file deploy.bicep \
    --parameters appName=$APP_NAME environment=$ENVIRONMENT \
    --mode Incremental

# Get function app name
FUNCTION_APP_NAME=$(az deployment group show \
    --resource-group $RESOURCE_GROUP \
    --name deploy \
    --query properties.outputs.functionAppName.value \
    --output tsv)

echo "Function App Name: $FUNCTION_APP_NAME"

# Build application
echo "Building application..."
cd ..
npm install
npm run build

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy to Azure Functions
echo "Deploying to Azure Functions..."
func azure functionapp publish $FUNCTION_APP_NAME

# Get deployment URL
FUNCTION_URL=$(az functionapp show \
    --resource-group $RESOURCE_GROUP \
    --name $FUNCTION_APP_NAME \
    --query defaultHostName \
    --output tsv)

echo ""
echo "====================================="
echo "Deployment Complete!"
echo "====================================="
echo "Function App URL: https://$FUNCTION_URL"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in Azure Portal"
echo "2. Test the endpoints"
echo "3. Monitor with Application Insights"
echo "====================================="
