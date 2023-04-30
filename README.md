# Obsidian Local LLM Plugin

Obsidian Local LLM is a plugin for Obsidian that provides access to a powerful neural network, allowing users to generate text in a wide range of styles and formats using a local LLM from the LLAMA family.

The plugin allows users to input a prompt as a canvas block and receive answers in the new block. The LLM can be configured to use a variety of models and settings, allowing users to customize the output to their specific needs.

## Dependencies
The plugin uses a [server](https://github.com/abetlen/llama-cpp-python/blob/main/llama_cpp/server/__main__.py) from [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) as the API backend, which relies on the [llama.cpp](https://github.com/ggerganov/llama.cpp) library. The plugin also requires Python 3.7 or later and the pip package manager to be installed on your system.

To install llama-cpp-python and its dependencies, run the following command:

```bash
pip install llama-cpp-python[server]
```
### Large Language Models
Folow the [link to the repository](https://github.com/underlines/awesome-marketing-datascience/blob/master/awesome-ai.md), click 'Show Table with models' and choose the model which is suitable for you and in the '[ggml](https://github.com/ggerganov/ggml)' format.

## Usage
To use the plugin, follow these steps:

1. Open a terminal
2. Set environment variable with the [ggml](https://github.com/ggerganov/ggml) model path example: `export MODEL=/.../ggml-model-name.bin`
2. Run the API server using the command `python3 -m llama_cpp.server`
3. Don't close the terminal until you want to use the plugin
1. Open a canvas in Obsidian
2. Create a new block
3. Type in a prompt text
4. Use Right-click on the block to open a context menu
5. Click on the "LLM Instruction" option
6. Wait for the generated text to appear in the new block


## Contributing

Contributions to the plugin are welcome! If you would like to contribute, please fork the repository and submit a pull request.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
