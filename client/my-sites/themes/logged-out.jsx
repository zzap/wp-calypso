/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ThemeShowcase from './theme-showcase';
import {
	preview,
	signup,
	separator,
	info,
	support,
	help,
} from './theme-options';

export default props => (
	<ThemeShowcase { ...props }
	options={ {
		signup,
		preview,
		separator,
		info,
		support,
		help
	} }
	defaultOption="signup"
	getScreenshotOption={ function() {
		return 'info';
	} } />
);
