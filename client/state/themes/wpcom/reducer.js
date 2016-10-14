/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { keyBy, reduce, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import ThemeQueryManager from 'lib/query-manager/theme';
import {
	THEME_DELETE,
	THEME_DELETE_SUCCESS,
	THEME_DELETE_FAILURE,
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEME_RESTORE,
	THEME_RESTORE_FAILURE,
	THEME_SAVE,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import counts from './counts/reducer';
import {
	getSerializedThemesQuery,
	normalizeThemeForState
} from './utils';
import { createReducer, isValidStateWithSchema } from 'state/utils';
import { itemsSchema, queriesSchema } from './schema';

/**
 * Tracks all known theme objects, indexed by ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer( {}, {
	[ THEMES_RECEIVE ]: ( state, action ) => {
		return Object.assign( {}, state, keyBy( action.themes, 'id' ) );
	}
}, itemsSchema );

/**
 * Returns the updated site theme requests state after an action has been
 * dispatched. The state reflects a mapping of site ID, theme ID pairing to a
 * boolean reflecting whether a request for the theme is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function siteRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEME_REQUEST:
		case THEME_REQUEST_SUCCESS:
		case THEME_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign( {}, state[ action.siteId ], {
					[ action.themeId ]: THEME_REQUEST === action.type
				} )
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated theme query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests( state = {}, action ) {
	switch ( action.type ) {
		case THEMES_REQUEST:
		case THEMES_REQUEST_SUCCESS:
		case THEMES_REQUEST_FAILURE:
			const serializedQuery = getSerializedThemesQuery( action.query, action.siteId );
			return Object.assign( {}, state, {
				[ serializedQuery ]: THEMES_REQUEST === action.type
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return state;
}

/**
 * Returns the updated theme query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of theme IDs
 * for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const queries = ( () => {
	function applyToManager( state, siteId, method, createDefault, ...args ) {
		if ( ! state[ siteId ] ) {
			if ( ! createDefault ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: ( new ThemeQueryManager() )[ method ]( ...args )
			};
		}

		const nextManager = state[ siteId ][ method ]( ...args );
		if ( nextManager === state[ siteId ] ) {
			return state;
		}

		return {
			...state,
			[ siteId ]: nextManager
		};
	}

	return createReducer( {}, {
		[ THEME_RESTORE ]: ( state, { siteId, themeId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: themeId,
				status: '__RESTORE_PENDING'
			}, { patch: true } );
		},
		[ THEME_RESTORE_FAILURE ]: ( state, { siteId, themeId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: themeId,
				status: 'trash'
			}, { patch: true } );
		},
		[ THEMES_REQUEST_SUCCESS ]: ( state, { siteId, query, themes, found } ) => {
			const normalizedThemes = themes.map( normalizeThemeForState );
			return applyToManager( state, siteId, 'receive', true, normalizedThemes, { query, found } );
		},
		[ THEMES_RECEIVE ]: ( state, { themes } ) => {
			const themesBySiteId = reduce( themes, ( memo, theme ) => {
				return Object.assign( memo, {
					[ theme.site_ID ]: [
						...( memo[ theme.site_ID ] || [] ),
						normalizeThemeForState( theme )
					]
				} );
			}, {} );

			return reduce( themesBySiteId, ( memo, siteThemes, siteId ) => {
				return applyToManager( memo, siteId, 'receive', true, siteThemes );
			}, state );
		},
		[ THEME_SAVE ]: ( state, { siteId, themeId, theme } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: themeId,
				...theme
			}, { patch: true } );
		},
		[ THEME_DELETE ]: ( state, { siteId, themeId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: themeId,
				status: '__DELETE_PENDING'
			}, { patch: true } );
		},
		[ THEME_DELETE_FAILURE ]: ( state, { siteId, themeId } ) => {
			return applyToManager( state, siteId, 'receive', false, {
				ID: themeId,
				status: 'trash'
			}, { patch: true } );
		},
		[ THEME_DELETE_SUCCESS ]: ( state, { siteId, themeId } ) => {
			return applyToManager( state, siteId, 'removeItem', false, themeId );
		},
		[ SERIALIZE ]: ( state ) => {
			return mapValues( state, ( { data, options } ) => ( { data, options } ) );
		},
		[ DESERIALIZE ]: ( state ) => {
			if ( ! isValidStateWithSchema( state, queriesSchema ) ) {
				return {};
			}

			return mapValues( state, ( { data, options } ) => {
				return new ThemeQueryManager( data, options );
			} );
		}
	} );
} )();

export default combineReducers( {
	counts,
	items,
	siteRequests,
	queryRequests,
	queries
} );
