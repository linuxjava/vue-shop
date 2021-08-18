module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'eqeqeq': 'off', // 关闭===代替==的告警
    'default-case': 'off', // 关闭switch没有default的告警
    'array-callback-return': 'off', // 关闭数组函数没有return的告警
    'no-script-url': 'off', // 关闭a标签href无url的告警
    'jsx-a11y/anchor-is-valid': 'off', // 
    'jsx-a11y/anchor-has-content': 'off', // 关闭jsx a标签无内容的告警
    // allow paren-less arrow functions
    'arrow-parens': 0,
    "no-unused-vars": [2, { 
      // 允许声明未使用变量
      "vars": "local",
      // 参数不检查
      "args": "none" 
    }],
    // 关闭语句强制分号结尾
    "semi": [0],
    //空行最多不能超过100行
    "no-multiple-empty-lines": [0, {"max": 100}],
    //关闭禁止混用tab和空格
    "no-mixed-spaces-and-tabs": [0],
    //禁止console报错检查
    'no-console':  'off',
    //禁止空格报错检查
    'generator-star-spacing': 'off'
  }
}
