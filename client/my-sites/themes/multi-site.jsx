/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ThemesSiteSelectorModal from './themes-site-selector-modal';
import {
	preview,
	purchase,
	activate,
	tryandcustomize,
	separator,
	info,
	support,
	help
} from './theme-options';
import ThemeShowcase from './theme-showcase';

const ThemesMultiSite = props => (
	<ThemesSiteSelectorModal { ...props } sourcePath="/design">
		<ThemeShowcase { ...props }>
			<SidebarNavigation />
		</ThemeShowcase>
	</ThemesSiteSelectorModal>
);

function MultiSiteThemeShowcase( props ) {
	return (
		<ThemesMultiSite { ...props }
			options={ {
				preview,
				purchase,
				activate,
				tryandcustomize,
				separator,
				info,
				support,
				help,
			} }
			defaultOption="activate"
			secondaryOption="tryandcustomize"
			getScreenshotOption={ function() {
				return 'info';
			} } />
	);
}

export default MultiSiteThemeShowcase;
