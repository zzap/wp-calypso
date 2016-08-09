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
		it( 'should return the signup URL with a free theme picked', () => {
			const signupUrl = getThemeSignupUrl( {}, { id: 'twentysixteen' } );

			expect( signupUrl ).to.equal( '/start/with-theme?ref=calypshowcase&theme=twentysixteen' );
		} );
	} );
} );
