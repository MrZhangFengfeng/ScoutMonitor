import webpack from 'webpack'
import { merge } from "webpack-merge"
import commonConfig from './webpack.common'

const devConfig = (): webpack.Configuration => {
    return {
        mode: 'development'
    }
}

export default merge(commonConfig(), devConfig())