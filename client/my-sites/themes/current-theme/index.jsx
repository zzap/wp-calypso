/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CurrentThemeButton from './button';
import {
	customize,
	info,
	support,
	bindOptionsToState,
	bindOptionsToDispatch,
	bindOptionsToSite
} from '../theme-options';
import { trackClick } from '../helpers';
import { isJetpackSite } from 'state/sites/selectors';
import { canCurrentUser } from 'state/current-user/selectors';
import { getCurrentTheme } from 'state/themes/current-theme/selectors';
import QueryCurrentTheme from 'components/data/query-current-theme';

/**
 * Show current active theme for a site, with
 * related actions.
 */
const CurrentTheme = React.createClass( {

	propTypes: {
		options: PropTypes.objectOf( PropTypes.shape( {
			label: PropTypes.string.isRequired,
			icon: PropTypes.string.isRequired,
			getUrl: PropTypes.func.isRequired
		} ) ),
		site: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		// connected props
		isCustomizable: PropTypes.bool.isRequired,
		isJetpack: PropTypes.bool.isRequired,
		currentTheme: PropTypes.object
	},

	trackClick: trackClick.bind( null, 'current theme' ),

	render() {
		const { currentTheme, site } = this.props,
			placeholderText = <span className="current-theme__placeholder">loading...</span>,
			text = ( currentTheme && currentTheme.name ) ? currentTheme.name : placeholderText;

		return (
			<Card className="current-theme">
				{ site && <QueryCurrentTheme siteId={ site.ID }/> }
				<div className="current-theme__current">
					<span className="current-theme__label">
						{ this.translate( 'Current Theme' ) }
					</span>
					<span className="current-theme__name">
						{ text }
					</span>
				</div>
				<div className={ classNames(
					'current-theme__actions',
					{ 'two-buttons': Object.keys( this.props.options ).length === 2 }
					) } >
					{ map( this.props.options, ( option, name ) => (
						<CurrentThemeButton
							key={ name }
							name={ name }
							label={ option.label }
							icon={ option.icon }
							href={ currentTheme && option.getUrl( currentTheme ) }
							onClick={ this.trackClick } />
					) ) }
				</div>
			</Card>
		);
	}
} );

const myOptions = {
	customize,
	info,
	support
};

export default connect(
	( state, props ) => {
		const { site: selectedSite } = props;
		const currentTheme = selectedSite && getCurrentTheme( state, selectedSite.ID );
		const theme = Object.assign( {}, currentTheme, { active: true } );

		const options = bindOptionsToState( myOptions, state );

		const filteredOptions = pickBy( options, option => ! option.hideForSite &&
			! ( option.hideForTheme && option.hideForTheme( theme ) )
		);

		const boundOptions = bindOptionsToSite( filteredOptions, selectedSite );

		return {
			isJetpack: selectedSite && isJetpackSite( state, selectedSite.ID ),
			isCustomizable: selectedSite && canCurrentUser( state, selectedSite.ID, 'edit_theme_options' ),
			currentTheme,
			options: boundOptions
		};
	},
	bindOptionsToDispatch( myOptions, 'current theme' )
)( CurrentTheme );
