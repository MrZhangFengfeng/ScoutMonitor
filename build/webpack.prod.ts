import webpack from 'webpack'
import { merge } from "webpack-merge"
import commonConfig from './webpack.common'
import { CleanWebpackPlugin } from 'clean-webpack-plugin' //清理dist文件夹
import TerserPlugin from "terser-webpack-plugin"  // 压缩JS文件

const prodConfig = (): webpack.Configuration => {
    return {
        mode: 'production',
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin()
            ]
        },
        plugins: [new CleanWebpackPlugin()]
    }
}

export default merge(commonConfig(), prodConfig())