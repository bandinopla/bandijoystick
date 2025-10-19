import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  publicDir: false, 

  build: {

	outDir:"dist",
    lib: {
      entry: resolve(__dirname, 'src/module.ts'),
      name: 'BandiJoystick',
	  formats: ['es', 'cjs', 'umd' ],
    }, 
	
    rollupOptions: { 
      external: [ 'trystero', 'trystero/firebase', 'qrcode' ],
      output: { 
        globals: {
          'trystero/firebase': 'TrysteroFirebase',
          'trystero': 'Trystero',
		  'qrcode': "QR"
        },
      },
    },
  },
})