/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getThemeSignupUrl } from '../selectors';

describe( 'themes selectors', () => {
	describe( '#getThemeDetailsUrl', () => {

	} );

	describe( '#getThemeSupportUrl', () => {

	} );

	describe( '#getThemeHelpUrl', () => {

	} );

	describe( '#getThemeCustomizeUrl', () => {

	} );

	describe( '#getThemeSignupUrl', () => {
		context( 'with a free theme', () => {
			it( 'should return the correct signup URL', () => {
				const signupUrl = getThemeSignupUrl( {}, {
					id: 'twentysixteen',
					stylesheet: 'pub/twentysixteen'
				} );

				expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=twentysixteen' );
			} );
		} );

		context( 'with a premium theme', () => {
			it( 'should return the correct signup URL', () => {
				const signupUrl = getThemeSignupUrl( {}, {
					id: 'mood',
					stylesheet: 'premium/mood'
				} );

				expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=mood&premium=true' );
			} );
		} );
	} );
} );
