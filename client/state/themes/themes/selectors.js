/** @ssr-ready **/
/**
 * Internal dependencies
 */
import config from 'config';
import { getSiteSlug, getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { isPremiumTheme, oldShowcaseUrl } from './utils';

export function getThemes( state ) {
	return state.themes.themes.get( 'themes' ).toJS();
}

export function getThemeById( state, id ) {
	const theme = state.themes.themes.getIn( [ 'themes', id ] );
	return theme ? theme.toJS() : undefined;
}

export function getThemeDetailsUrl( state, theme, siteId ) {
	if ( ! theme ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) ) {
		return getSiteOption( state, siteId, 'admin_url' ) + 'themes.php?theme=' + theme.id;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

export function getThemeSupportUrl( state, theme, siteId ) {
	if ( ! theme || ! isPremiumTheme( theme ) ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';

	if ( config.isEnabled( 'manage/themes/details' ) ) {
		return `/theme/${ theme.id }/setup${ sitePart }`;
	}

	return `${ oldShowcaseUrl }${ sitePart }${ theme.id }/support`;
}

export function getThemeHelpUrl( state, theme, siteId ) {
	if ( ! theme ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) ) {
		return '//wordpress.org/support/theme/' + theme.id;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }/support`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

export function getThemePurchaseUrl( state, theme, siteId ) {
	return `/checkout/${ getSiteSlug( state, siteId ) }/theme:${ theme.id }`;
}

export function getThemeCustomizeUrl( state, theme, siteId ) {
	if ( ! siteId ) {
		return '/customize/';
	}

	if ( isJetpackSite( state, siteId ) ) {
		return getSiteOption( state, siteId, 'admin_url' ) +
			'customize.php?return=' +
			encodeURIComponent( window.location ) +
			( theme ? '&theme=' + theme.id : '' );
	}

	return '/customize/' + getSiteSlug( state, siteId ) + ( theme && theme.stylesheet ? '?theme=' + theme.stylesheet : '' );
}

export function getThemeSignupUrl( state, theme ) {
	if ( ! theme ) {
		return null;
	}

	let url = '/start/with-theme?ref=calypshowcase&theme=' + theme.id;

	if ( isPremiumTheme( theme ) ) {
		url += '&premium=true';
	}

	return url;
}
