/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import TermTreeSelectorTerms from 'blocks/term-tree-selector/terms';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormCheckbox from 'components/forms/form-checkbox';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormFieldset from 'components/forms/form-fieldset';
import viewport from 'lib/viewport';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostTypeTaxonomy } from 'state/post-types/taxonomies/selectors';
import { getTerms } from 'state/terms/selectors';
import { addTerm } from 'state/terms/actions';

class TermFormDialog extends Component {
	static initialState = {
		selectedParent: [],
		isTopLevel: true,
		isValid: false,
		error: null
	};

	static propTypes = {
		labels: PropTypes.object,
		onClose: PropTypes.func,
		onSuccess: PropTypes.func,
		postType: PropTypes.string,
		showDescriptionInput: PropTypes.bool,
		showDialog: PropTypes.bool,
		siteId: PropTypes.number,
		terms: PropTypes.array,
		taxonomy: PropTypes.string,
		translate: PropTypes.func
	};

	static defaultProps = {
		onClose: noop,
		onSuccess: noop,
		showDescriptionInput: false,
		showDialog: false
	};

	constructor( props ) {
		super( props );
		this.state = this.constructor.initialState;
		this.boundCloseDialog = this.closeDialog.bind( this );
		this.boundOnParentChange = this.onParentChange.bind( this );
		this.boundOnSearch = this.onSearch.bind( this );
		this.boundSaveTerm = this.saveTerm.bind( this );
		this.boundOnTopLevelChange = this.onTopLevelChange.bind( this );
		this.boundValidateInput = this.validateInput.bind( this );
	}

	onSearch( searchTerm ) {
		this.setState( { searchTerm: searchTerm } );
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.showDialog !== this.props.showDialog ) {
			this.setState( {
				selectedParent: []
			} );
		}
	}

	closeDialog() {
		this.setState( this.constructor.initialState );
		this.props.onClose();
	}

	onParentChange( item ) {
		this.setState( {
			selectedParent: [ item.ID ],
			isTopLevel: false
		}, this.isValid );
	}

	onTopLevelChange() {
		this.setState( {
			isTopLevel: ! this.state.isTopLevel,
			selectedParent: []
		}, this.isValid );
	}

	getFormValues() {
		const name = ReactDom.findDOMNode( this.refs.termName ).value.trim();
		const formValues = { name };
		if ( this.props.isHierarchical ) {
			formValues.parent = this.state.selectedParent.length ? this.state.selectedParent[ 0 ] : 0;
		}
		if ( this.props.showDescriptionInput ) {
			formValues.description = ReactDom.findDOMNode( this.refs.termDescription ).value.trim();
		}

		return formValues;
	}

	isValid() {
		let error;

		const values = this.getFormValues();

		if ( ! values.name.length ) {
			error = true;
		}

		const lowerCasedTermName = values.name.toLowerCase();
		const matchingTerm = find( this.props.terms, ( term ) => {
			return ( term.name.toLowerCase() === lowerCasedTermName ) &&
				( ! this.props.isHierarchical || ( term.parent === values.parent ) );
		} );

		if ( matchingTerm ) {
			error = this.props.translate( 'Name already exists', {
				context: 'Terms: Add term error message - duplicate term name exists',
				textOnly: true
			} );
		}

		if ( error !== this.state.error ) {
			this.setState( {
				error: error,
				isValid: ! error
			} );
		}

		return ! error;
	}

	validateInput( event ) {
		if ( 13 === event.keyCode ) {
			this.saveTerm();
		} else {
			this.isValid();
		}
	}

	saveTerm() {
		const term = this.getFormValues();
		if ( ! this.isValid() ) {
			return;
		}

		const { siteId, taxonomy } = this.props;

		this.props
			.addTerm( siteId, taxonomy, term )
			.then( this.props.onSuccess );
		this.closeDialog();
	}

	renderParentSelector() {
		const { labels, siteId, taxonomy, translate } = this.props;
		const { searchTerm, selectedParent } = this.state;
		const query = {};
		if ( searchTerm && searchTerm.length ) {
			query.search = searchTerm;
		}

		return (
			<FormFieldset>
				<FormLegend>
					{ labels.parent_item }
				</FormLegend>
				<FormLabel>
					<FormCheckbox ref="topLevel" checked={ this.state.isTopLevel } onChange={ this.boundOnTopLevelChange } />
					<span>{ translate( 'Top level', { context: 'Terms: New term being created is top level' } ) }</span>
				</FormLabel>
				<TermTreeSelectorTerms
					siteId={ siteId }
					taxonomy={ taxonomy }
					onSearch={ this.boundOnSearch }
					onChange={ this.boundOnParentChange }
					query={ query }
					selected={ selectedParent }
				/>
			</FormFieldset>
		);
	}

	render() {
		const { isHierarchical, labels, translate, showDescriptionInput, showDialog } = this.props;
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' )
		}, {
			action: 'add',
			label: translate( 'Add' ),
			isPrimary: true,
			disabled: ! this.state.isValid,
			onClick: this.boundSaveTerm
		} ];

		const isError = this.state.error && !! this.state.error.length;

		return (
			<Dialog
				autoFocus={ false }
				isVisible={ showDialog }
				buttons={ buttons }
				onClose={ this.boundCloseDialog }
				additionalClassNames="term-form-dialog">
				<FormSectionHeading>{ labels.add_new_item }</FormSectionHeading>
				<FormFieldset>
					<FormTextInput
						autoFocus={ showDialog && ! viewport.isMobile() }
						placeholder={ labels.new_item_name }
						ref="termName"
						isError={ isError }
						onKeyUp={ this.boundValidateInput } />
					{ isError && <FormInputValidation isError text={ this.state.error } /> }
				</FormFieldset>
				{ showDescriptionInput && <FormFieldset>
						<FormLegend>
							{ translate( 'Description', { context: 'Terms: Term description label' } ) }
						</FormLegend>
						<FormTextarea
							ref="termDescription"
							onKeyUp={ this.boundValidateInput } />
					</FormFieldset>
				}
				{ isHierarchical && this.renderParentSelector() }
			</Dialog>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { taxonomy, postType } = ownProps;
		const siteId = getSelectedSiteId( state );
		const taxonomyDetails = getPostTypeTaxonomy( state, siteId, postType, taxonomy );
		const labels = get( taxonomyDetails, 'labels', {} );
		const isHierarchical = get( taxonomyDetails, 'hierarchical', false );

		return {
			terms: getTerms( state, siteId, taxonomy ),
			isHierarchical,
			labels,
			siteId
		};
	},
	{ addTerm }
)( localize( TermFormDialog ) );
