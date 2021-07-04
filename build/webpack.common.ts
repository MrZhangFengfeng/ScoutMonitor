import webpack from 'webpack'
import path from 'path'

const commonConfig = (): webpack.Configuration => {
    return {
        context: path.resolve(__dirname, '../'),
        entry: './src/index.ts',
        output: {
            path: path.resolve(__dirname, '../dist'),
            filename: '[name].[contenthash:8].bundle.js',
            chunkFilename: 'chunk/[name].[contenthash:8].chunk.js'
        },
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                "@assets": path.join(__dirname, "../assets")
            }
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx|js|jsx)$/,
                    use: {
                        loader: "babel-loader"
                    },
                    exclude: /node_modules/
                }
            ]
        }
    }
}


export default commonConfig