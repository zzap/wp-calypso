/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import {
	isExternal,
	withoutHttp,
	addSchemeIfMissing,
	setUrlScheme,
} from '../';

describe( 'withoutHttp', () => {
	it( 'should return null if URL is not provided', () => {
		expect( withoutHttp() ).to.be.null;
	} );

	it( 'should return URL without initial http', () => {
		const urlWithHttp = 'http://example.com';
		const urlWithoutHttp = withoutHttp( urlWithHttp );

		expect( urlWithoutHttp ).to.equal( 'example.com' );
	} );

	it( 'should return URL without initial https', () => {
		const urlWithHttps = 'https://example.com';
		const urlWithoutHttps = withoutHttp( urlWithHttps );

		expect( urlWithoutHttps ).to.equal( 'example.com' );
	} );

	it( 'should return URL without initial http and query string if has any', () => {
		const urlWithHttpAndQueryString = 'http://example.com?foo=bar#anchor';
		const urlWithoutHttpAndQueryString = withoutHttp( urlWithHttpAndQueryString );

		expect( urlWithoutHttpAndQueryString ).to.equal( 'example.com?foo=bar#anchor' );
	} );

	it( "should return provided URL if it doesn't include http(s)", () => {
		const urlWithoutHttp = 'example.com';

		expect( withoutHttp( urlWithoutHttp ) ).to.equal( urlWithoutHttp );
	} );

	it( 'should return empty string if URL is empty string', () => {
		const urlEmptyString = '';

		expect( withoutHttp( urlEmptyString ) ).to.equal( '' );
	} );
} );

describe( 'isExternal', () => {
	it( 'should return false for relative path-only url', () => {
		const source = '/relative';

		const actual = isExternal( source );

		expect( actual ).to.be.false;
	} );

	it( 'should return false for relative query-only url', () => {
		const source = '?foo=bar';

		const actual = isExternal( source );

		expect( actual ).to.be.false;
	} );

	describe( 'with global.window (test against window.location.hostname)', () => {
		// window.location.hostname === 'example.com'
		useFakeDom();

		it( 'should return false for for internal protocol-relative url', () => {
			const source = '//example.com';

			const actual = isExternal( source );

			expect( actual ).to.be.false;
		} );

		it( 'should return true for for external protocol-relative url', () => {
			const source = '//some-other-site.com';

			const actual = isExternal( source );

			expect( actual ).to.be.true;
		} );

		it( 'should return false for internal url', () => {
			const source = 'https://example.com';

			const actual = isExternal( source );

			expect( actual ).to.be.false;
		} );

		it( 'should return true for external url', () => {
			const source = 'https://not-example.com';

			const actual = isExternal( source );

			expect( actual ).to.be.true;
		} );
	} );

	describe( 'without global.window (test against config hostname)', () => {
		it( 'should return false for internal protocol-relative url', () => {
			const source = '//calypso.localhost';

			const actual = isExternal( source );

			expect( actual ).to.be.false;
		} );

		it( 'should return true for external protocol-relative url', () => {
			const source = '//some-other-site.com';

			const actual = isExternal( source );

			expect( actual ).to.be.true;
		} );

		it( 'should return false for internal url', () => {
			const source = 'https://calypso.localhost/me';

			const actual = isExternal( source );

			expect( actual ).to.be.false;
		} );

		it( 'should return true for external url', () => {
			const source = 'https://not.localhost/me';

			const actual = isExternal( source );

			expect( actual ).to.be.true;
		} );
	} );
} );

describe( 'addSchemeIfMissing()', () => {
	it( 'should add scheme if missing', () => {
		const source = 'example.com/path';
		const expected = 'https://example.com/path';

		const actual = addSchemeIfMissing( source, 'https' );

		expect( actual ).to.equal( expected );
	} );

	it( 'should skip if scheme exists', () => {
		const source = 'https://example.com/path';
		const expected = 'https://example.com/path';

		const actual = addSchemeIfMissing( source, 'https' );

		expect( actual ).to.equal( expected );
	} );
} );

describe( 'setUrlScheme()', () => {
	it( 'should skip if scheme already set', () => {
		const source = 'http://example.com/path';
		const expected = 'http://example.com/path';

		const actual = setUrlScheme( source, 'http' );

		expect( actual ).to.equal( expected );
	} );

	it( 'should add scheme if missing', () => {
		const source = 'example.com/path';
		const expected = 'http://example.com/path';

		const actual = setUrlScheme( source, 'http' );

		expect( actual ).to.equal( expected );
	} );

	it( 'should replace scheme if different', () => {
		const source = 'https://example.com/path';
		const expected = 'http://example.com/path';

		const actual = setUrlScheme( source, 'http' );

		expect( actual ).to.equal( expected );
	} );
} );
