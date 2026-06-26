/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // 精确命中平板横屏（避免按宽度误伤 12.9" 竖屏 1024px）
        'ipad-land': { raw: '(min-width: 1024px) and (orientation: landscape)' },
      },
      colors: {
        sky: {
          soft: '#bfe6ff',
          DEFAULT: '#4fb0f0',
          deep: '#2b8fd6',
        },
        cream: '#fff7e6',
        grass: '#8ed081',
        coral: '#ff8a65',
        candy: '#ffb3d9',
      },
      fontFamily: {
        round: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '28px',
        btn: '20px',
      },
      boxShadow: {
        soft: '0 10px 30px -8px rgba(80, 120, 170, 0.25)',
        pop: '0 6px 0 0 rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
