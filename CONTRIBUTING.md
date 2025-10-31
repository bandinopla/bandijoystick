# Contributing to BandiJoystick.js
This document will help you set up a local development environment, understand the project structure, and submit high-quality contributions.

## License Agreement
By submitting a pull request, you agree to license your contributions under the MIT License, the same license as the project. See the LICENSE file for details.

## Project Structure
```bash
module/ 			# This is the BandiJoystick.js npm package folder
	src/ 			# the source files
		key/		# The available key objects
		layout/ 	# Types related to the layout of the joystick
		utils/ 		# Utility classes used in this model
public/				# the public folder of the website bandijoystickjs.web.app
scripts/			# scripts to automate tedius tasks while developing, node scripts...
src/ 				# the source of the website bandijoystickjs.web.app
	apps/			# Example apps, each has it's own folder.
	bandijoystick/ 	# The frontend app for the default virtual joystick that you see when you scan a QR code on the phone
	docs/ 			# markup doc files used by the site to show the documentation
	pages/ 			# the pages of the website's app
	utils/			# utility files used by the website
tests/				# file related to automated tests
```

# Setting Up Locally 

This project uses **pnpm**.  Install it if you don't have it:

```bash
npm install -g pnpm
```

## 1. Clone and install
```bash
git clone https://github.com/bandinopla/bandijoystick.git
cd bandijoystick
pnpm install
```

## 2. Dev mode
```bash
pnpm run dev
```
That will run the web app but it is set as to also mapped to look in the `module/` folder `bandijoystick` so you can change stuff in `module/src` and it will be hot reloaded.

When/if adding new button types or testing you will most likely work on a sample app in `"src/apps/your_example_app"` and `module/src` in parallel.

## Building
The web app `src/`:
```bash
pnpm run build
```

The npm module `module/`:
```bash
pnpm run build:module
```

# Pull Request Process

## 1. Fork
Fork the repo and create your branch from main:
```bash
git checkout -b name-of-your-feature
```
## 2. Dev & Test
Get familiar with [Playwright](https://playwright.dev/) and create tests for your feature and also make sure the other tests run with no errors (to check that nothing got broken)
```bash
pnpm run test
```

## 3. PR
Create the pull request to `main` branch and briefly explain the feature or bug fixed.


