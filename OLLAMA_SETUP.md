# Ollama Setup Guide for Local AI

This guide will help you set up Ollama to run AI models locally for the finance app's AI features.

## What is Ollama?

Ollama is a framework for running large language models locally on your machine. It allows you to run AI models without requiring API credits or internet connectivity.

## Installation

### Windows
1. Download Ollama from [https://ollama.ai/download](https://ollama.ai/download)
2. Run the installer and follow the setup wizard
3. Ollama will be installed as a service and start automatically

### macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Starting Ollama

After installation, Ollama should start automatically. If not:

### Windows
- Ollama runs as a Windows service and should start automatically
- You can check if it's running by opening Task Manager and looking for "ollama.exe"

### macOS/Linux
```bash
ollama serve
```

## Installing Models

The app will automatically download the required model when you first use AI features. However, you can also install models manually:

### Recommended Models

1. **Llama 2 (7B)** - Good balance of performance and resource usage
```bash
ollama pull llama2:7b
```

2. **Mistral (7B)** - Fast and efficient
```bash
ollama pull mistral:7b
```

3. **Code Llama (7B)** - Good for technical tasks
```bash
ollama pull codellama:7b
```

### Smaller Models (for lower-end machines)

1. **Llama 2 (3B)** - Smaller, faster
```bash
ollama pull llama2:3b
```

2. **Mistral (3B)** - Very fast
```bash
ollama pull mistral:3b
```

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Ollama Configuration
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
NEXT_PUBLIC_OLLAMA_MODEL=llama2:7b
```

### Model Selection

You can change the model by updating the `NEXT_PUBLIC_OLLAMA_MODEL` environment variable:

- `llama2:7b` - Default, good performance
- `mistral:7b` - Faster, good quality
- `codellama:7b` - Good for technical tasks
- `llama2:3b` - Smaller, faster
- `mistral:3b` - Very fast

## System Requirements

### Minimum Requirements
- **RAM**: 8GB (16GB recommended)
- **Storage**: 4GB free space for models
- **CPU**: Modern multi-core processor

### Recommended Requirements
- **RAM**: 16GB or more
- **Storage**: 10GB free space
- **GPU**: NVIDIA GPU with 8GB+ VRAM (optional, for faster inference)

## Testing the Setup

1. Start Ollama:
```bash
ollama serve
```

2. Test with a simple model:
```bash
ollama run llama2:7b "Hello, how are you?"
```

3. Check if the model is working in the app by visiting the transactions page and trying the AI categorization feature.

## Troubleshooting

### Ollama not starting
- **Windows**: Check if the Ollama service is running in Task Manager
- **macOS/Linux**: Run `ollama serve` in terminal and check for errors

### Model not downloading
- Check your internet connection
- Ensure you have enough disk space
- Try pulling the model manually: `ollama pull llama2:7b`

### Slow performance
- Try a smaller model (3B instead of 7B)
- Close other applications to free up RAM
- If you have a GPU, ensure CUDA is installed

### API errors
- Ensure Ollama is running on `http://localhost:11434`
- Check the browser console for detailed error messages
- Verify the model is installed: `ollama list`

## Available AI Features

Once Ollama is set up, you'll have access to:

1. **Transaction Categorization** - Automatically categorize transactions based on description
2. **Bulk Categorization** - Categorize multiple transactions at once
3. **Financial Insights** - Get AI-generated insights about your spending patterns
4. **AI Chat** - Chat with an AI assistant about your finances

## Performance Tips

1. **Use smaller models** for faster responses
2. **Close unused applications** to free up RAM
3. **Use SSD storage** for faster model loading
4. **Consider GPU acceleration** if available

## Security

- All AI processing happens locally on your machine
- No data is sent to external servers
- Models are downloaded once and stored locally
- Your financial data never leaves your device

## Support

If you encounter issues:

1. Check the [Ollama documentation](https://ollama.ai/docs)
2. Visit the [Ollama GitHub repository](https://github.com/ollama/ollama)
3. Check the browser console for error messages
4. Ensure Ollama is running and accessible at `http://localhost:11434` 