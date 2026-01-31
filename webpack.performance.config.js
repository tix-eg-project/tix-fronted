// Webpack performance optimization config
// This file can be used with webpack-merge to optimize bundle performance

const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'], // Remove specific functions
          },
          mangle: true,
          format: {
            comments: false, // Remove comments
          },
        },
        extractComments: false,
      }),
    ],
    
    // Code splitting
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        axios: {
          test: /[\\/]node_modules[\\/]axios[\\/]/,
          name: 'axios',
          chunks: 'all',
          priority: 15,
        },
        i18n: {
          test: /[\\/]node_modules[\\/](react-i18next|i18next)[\\/]/,
          name: 'i18n',
          chunks: 'all',
          priority: 15,
        },
      },
    },
    
    // Runtime chunk
    runtimeChunk: {
      name: 'runtime',
    },
    
    // Module concatenation
    concatenateModules: true,
    
    // Tree shaking
    usedExports: true,
    sideEffects: false,
  },
  
  plugins: [
    // Gzip compression
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
    
    // Brotli compression
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11,
      },
      threshold: 8192,
      minRatio: 0.8,
    }),
    
    // Bundle analyzer (only in development)
    ...(process.env.ANALYZE === 'true' ? [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
      })
    ] : []),
  ],
  
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 512000, // 500KB
  },
  
  // Module resolution optimization
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assests'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  
  // Loader optimization
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            presets: [
              ['@babel/preset-env', { modules: false }],
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-proposal-class-properties',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: false,
              sourceMap: false,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]',
              outputPath: 'images/',
              publicPath: '/images/',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 85,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 85,
              },
            },
          },
        ],
      },
    ],
  },
  
  // Output optimization
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    clean: true,
  },
  
  // Devtool optimization
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-cheap-module-source-map',
  
  // Stats configuration
  stats: {
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    modules: false,
    moduleTrace: false,
    source: false,
    reasons: false,
    usedExports: false,
    providedExports: false,
    optimizationBailout: false,
    errorDetails: false,
    colors: true,
    timings: true,
    performance: true,
    hash: false,
    version: false,
    builtAt: false,
    entrypoints: false,
  },
};
