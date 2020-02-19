import { LightningElement, api, track, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import getRecordTypeName from '@salesforce/apex/LWCC001_AutoResponseForm.getRecordTypeName';
import getMetadata from '@salesforce/apex/LWCC001_AutoResponseForm.getFormDisplayMetadata';
import getRequiredFieldsExtra from '@salesforce/apex/LWCC001_AutoResponseForm.getFormRequiredFieldsExtra';
import updateCase from '@salesforce/apex/LWCC001_AutoResponseForm.updateCase';
import RECORDTYPEID_FIELD from '@salesforce/schema/Case.RecordTypeId';
import FORMCOMPLETED_FIELD from '@salesforce/schema/Case.TECH_FormCompleted__c';
import CASENUMBER_FIELD from '@salesforce/schema/Case.CaseNumber';
import SENDERTYPE_FIELD from '@salesforce/schema/Case.SenderType__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Case.Description';
import sendForm from '@salesforce/label/c.F2ML_LBL007_SendForm';
import formSuccessMessage from '@salesforce/label/c.F2ML_LBL009_FormSuccessMessage';
import formAlreadySent from '@salesforce/label/c.F2ML_LBL010_FormAlreadySent';
import requiredFields from '@salesforce/label/c.F2ML_LBL011_RequiredFields';
import noRequestForThisUrl from '@salesforce/label/c.F2ML_LBL012_NoRequestForThisUrl';
import free2MoveLease from '@salesforce/label/c.F2ML_LBL014_Free2MoveLease';
import requestTransmission from '@salesforce/label/c.F2ML_LBL015_RequestTransmission';
import whoAreYou from '@salesforce/label/c.F2ML_LBL016_WhoAreYou';
import keepFileNumber from '@salesforce/label/c.F2ML_LBL017_KeepFileNumber';
const fields = [RECORDTYPEID_FIELD, FORMCOMPLETED_FIELD, CASENUMBER_FIELD, SENDERTYPE_FIELD, DESCRIPTION_FIELD];

export default class Lwc004_AutoResponseFormCustom extends LightningElement {

    @api recordId; // The case ID is passed through a URL param.
    @track isLoaded = false; // Set the waiting spinner display on client-server trips.
    @track recordTypeId; // The record type conditions the whole form display.
    @track caseNumber; // Case Number to be remembered by the user when the form successfully submits.
    @track senderTypeOptions;
    @track requestTypeIsDisabled = true;
    @track totalRequestTypeOptions;
    @track requestTypeOptions;
    @track requestTypeControllerValues;
    @track totalRequestSubtypeOptions;
    @track requestSubtypeOptions;
    @track requestSubtypeIsDisabled = true;
    @track requestSubtypeControllerValues;
    @track description; // The description input is prefilled with the case description.
    @track floor; // The floor is the record type developer name.
    @track formCompleted = false; // The form can only be fulfilled once. A message tells if it has already been.
    @track hideForm = false; // Hides the form when it has already been fulfilled once.
    @track senderType; // Informing the sender type unlocks the rest of the form with the right inputs.
    @track requestType; // When request type changes, the required fields update accordingly.
    @track visibleFields; // List of fields to display from a custom metadata.
    @track requiredFieldsBase; // List of required fields according to the floor and the sender type.
    @track requiredFields; // Same as above plus extra fields according to the request type for some floors.
    @track message; // Error message to be displayed for users.
    label = { sendForm, formSuccessMessage, formAlreadySent, requiredFields, noRequestForThisUrl,
              free2MoveLease, requestTransmission, whoAreYou, keepFileNumber }; // Imported custom labels.
    
    @wire(getRecord, { recordId: '$recordId', fields })
    loadCase({ error, data }) {
        if (error) {
            this.message = error;
        }
        else if (data) {
            this.message = undefined;
            if (data.fields.TECH_FormCompleted__c.value) {
                this.formCompleted = true;
                this.hideForm = true;
            }
            else {
                this.caseNumber = data.fields.CaseNumber.value;
				if (data.fields.SenderType__c.value) {
                    this.senderType = data.fields.SenderType__c.value;
				}
                this.description = data.fields.Description.value;
				if (data.fields.RecordTypeId.value) {
					this.recordTypeId = data.fields.RecordTypeId.value;
				}
            }
        }
    }
    
    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: 'Case.SenderType__c' })
    setSenderTypeOptions({ error, data }) {
        if (error) {
            this.message = error;
            this.senderTypeOptions = undefined;
        }
        else if (data) {
            this.message = undefined;
            this.senderTypeOptions = data.values;
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: 'Case.F2MLRequestType__c' })
    setRequestTypeOptions({ error, data }) {
        if (error) {
            this.message = error;
            this.totalRequestTypeOptions = undefined;
        }
        else if (data) {
            this.message = undefined;
            this.totalRequestTypeOptions = data.values;
            this.requestTypeControllerValues = data.controllerValues;
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: 'Case.F2MLRequestSubtype__c' })
    setRequestSubtypeOptions({ error, data }) {
        if (error) {
            this.message = error;
            this.totalRequestSubtypeOptions = undefined;
        }
        else if (data) {
            this.message = undefined;
            this.totalRequestSubtypeOptions = data.values;
            this.requestSubtypeControllerValues = data.controllerValues;
        }
    }

    @wire(getRecordTypeName, { recordTypeId: '$recordTypeId' })
    setFloor({ error, data }) {
        if (error) {
            this.message = error;
            this.floor = undefined;
        }
        else if (data) {
            this.message = undefined;
            this.floor = data;
            if (this.floor === 'F2MLServices') {
                this.senderType = 'Customer';
                this.handleSenderTypeChange(this.senderType);
                this.template.querySelector('lightning-combobox.sender-type-combobox').classList.add('slds-hide');
                this.requestTypeIsDisabled = false;
            }
        }
        this.isLoaded = true;
    }
    
    @wire(getMetadata, { floor: '$floor', senderType: '$senderType' })
    setFields({ error, data }) {
        var temp = this.template;
        if (error) {
            this.message = error;
            this.visibleFields = undefined;
            this.requiredFieldsBase = undefined;
            this.template.querySelector('.form-bottom').classList.add('slds-hide');
        }
        else if (data) {
            this.message = undefined;
            if (data && data.VisibleFields__c) {
                this.visibleFields = data.VisibleFields__c.replace(/\s/g, '').split(';');
                if (this.visibleFields) {
                    temp.querySelector('.RRDICode__c').classList.add('slds-hide');
                    temp.querySelector('.F2MLRequestType__c').classList.add('slds-hide');
                    temp.querySelector('.F2MLRequestSubtype__c').classList.add('slds-hide');
                    temp.querySelector('.F2MLVehicleRegistrationNumber__c').classList.add('slds-hide');
                    temp.querySelector('.F2MLSiren__c').classList.add('slds-hide');
                    temp.querySelector('.Description').classList.add('slds-hide');
                    this.visibleFields.forEach(function (visibleField) {
                        var selector = '.' + visibleField;
                        temp.querySelector(selector).classList.remove('slds-hide');
                    });
                    this.template.querySelector('.form-bottom').classList.remove('slds-hide');
                }
            }
            if (data && data.RequiredFields__c) {
                this.requiredFieldsBase = data.RequiredFields__c.replace(/\s/g, '').split(';');
                this.requiredFields = this.requiredFieldsBase;
                if (this.requiredFields) {
                    temp.querySelector('.RRDICode__c').required = false;
                    temp.querySelector('.F2MLRequestType__c').required = false;
                    temp.querySelector('.F2MLRequestSubtype__c').required = false;
                    temp.querySelector('.F2MLVehicleRegistrationNumber__c').required = false;
                    temp.querySelector('.F2MLSiren__c').required = false;
                    temp.querySelector('.Description').required = false;
                    this.requiredFields.forEach(function (requiredField) {
                        var selector = '.' + requiredField;
                        temp.querySelector(selector).required = true;
                    });
                }
            }
        }
        if (this.senderType) {
            this.isLoaded = true;
        }
    }

    handleSenderTypeComboboxChange(event) {
        if (event.detail.value) {
            this.handleSenderTypeChange(event.detail.value);
        }
    }

    handleSenderTypeChange(senderType) {
        this.isLoaded = false;
        if (senderType) {
            this.senderType = senderType;
            this.template.querySelector('.form-bottom').classList.remove('slds-hide');

            let requestTypeValues = [];
            this.totalRequestTypeOptions.forEach(value => {
                if (value.validFor.includes(this.requestTypeControllerValues[this.senderType])) {
                    requestTypeValues.push(value);
                }
            })
            this.requestTypeOptions = requestTypeValues;
            this.requestTypeIsDisabled = false;
        }
        else {
            this.senderType = undefined;
            this.visibleFields = undefined;
            this.template.querySelector('.form-bottom').classList.add('slds-hide');
        }
        if (!this.senderType) {
            this.isLoaded = true;
        }
    }

    handleRequestTypeComboboxChange(event) {
        if (event.detail.value) {
            this.requestType = event.detail.value;
            let requestSubtypeValues = [];
            this.totalRequestSubtypeOptions.forEach(value => {
                if (value.validFor.includes(this.requestSubtypeControllerValues[this.requestType])) {
                    requestSubtypeValues.push(value);
                }
            })
            this.requestSubtypeOptions = requestSubtypeValues;
            if (!this.requestSubtypeOptions || !this.requestSubtypeOptions.length) {
                this.requestSubtypeIsDisabled = true;
            }
            else {
                this.requestSubtypeIsDisabled = false;
            }
        }
        else {
            this.requestType = undefined;
            this.requestSubtypeIsDisabled = true;
        }
    }

    @wire(getRequiredFieldsExtra, { floor: '$floor', requestType: '$requestType' })
    getRequiredFieldsByRequestType({ error, data }) {
        var requiredFieldsExtra;
        if (error) {
            this.message = error;
        }
        else if (data) {
            this.message = undefined;
            requiredFieldsExtra = data.replace(/\s/g, '').split(';');
            this.setRequiredFieldsByRequestType(requiredFieldsExtra);
        }
    }

    setRequiredFieldsByRequestType(requiredFieldsExtra) {
        var temp = this.template;
        var reqFields = this.requiredFieldsBase.slice(0);
        requiredFieldsExtra.forEach(function (requiredFieldExtra) {
            reqFields.push(requiredFieldExtra);
        });
        this.requiredFields = reqFields;
        temp.querySelector('.RRDICode__c').required = false;
        temp.querySelector('.F2MLRequestType__c').required = false;
        temp.querySelector('.F2MLRequestSubtype__c').required = false;
        temp.querySelector('.F2MLVehicleRegistrationNumber__c').required = false;
        temp.querySelector('.F2MLSiren__c').required = false;
        temp.querySelector('.Description').required = false;
        this.requiredFields.forEach(function (requiredField) {
            var selector = '.' + requiredField;
            temp.querySelector(selector).required = true;
        });
    }

    handleClickOnSubmit() {
        var formFields = new Map();
        var senderTypeInput = this.template.querySelector('.SenderType__c');
        var rrdiCodeInput = this.template.querySelector('.RRDICode__c');
        var requestTypeInput = this.template.querySelector('.F2MLRequestType__c');
        var requestSubtypeInput = this.template.querySelector('.F2MLRequestSubtype__c');
        var vehicleRegistrationNumberInput = this.template.querySelector('.F2MLVehicleRegistrationNumber__c');
        var sirenInput = this.template.querySelector('.F2MLSiren__c');
        var descriptionInput = this.template.querySelector('.Description');
        this.isLoaded = false;
        this.template.querySelector('.error-frame').classList.add('slds-hide');
        if (senderTypeInput.value) {
            formFields.SenderType__c = senderTypeInput.value;
        }
        if (rrdiCodeInput.value) {
            formFields.RRDICode__c = rrdiCodeInput.value;
        }
        if (requestTypeInput.value) {
            formFields.F2MLRequestType__c = requestTypeInput.value;
        }
        if (requestSubtypeInput.value) {
            formFields.F2MLRequestSubtype__c = requestSubtypeInput.value;
        }
        if (vehicleRegistrationNumberInput.value) {
            formFields.F2MLVehicleRegistrationNumber__c = vehicleRegistrationNumberInput.value;
        }
        if (sirenInput.value) {
            formFields.F2MLSiren__c = sirenInput.value;
        }
        if (descriptionInput.value) {
            formFields.Description = descriptionInput.value;
        }
        if (senderTypeInput.reportValidity() && rrdiCodeInput.reportValidity() && requestTypeInput.reportValidity() && requestSubtypeInput.reportValidity()
            && vehicleRegistrationNumberInput.reportValidity() && sirenInput.reportValidity() && descriptionInput.reportValidity()) {
            this.handleUpdate(formFields);
        }
        else {
            this.isLoaded = true;
        }
    }
    
    handleSuccess() {
        this.template.querySelector('.record-edit-form').classList.add('slds-hide');
        this.template.querySelector('p').classList.remove('slds-hide');
    }

    handleUpdate(formFields) {
        updateCase({ caseId: this.recordId, fields: formFields })
            .then(result => {
                this.mesage = undefined;
                if (result === 'Success') {
                    this.template.querySelector('.error-frame').classList.add('slds-hide');
                    this.template.querySelector('.success-frame').classList.remove('slds-hide');
                    this.template.querySelector('.record-edit-form').classList.add('slds-hide');
                }
                else {
                    if (result.includes('max length=')) {
                        result = result.replace('max length=', 'nombre maximum de caractères=')
                    }
                    this.message = result;
                    this.template.querySelector('.error-frame').classList.remove('slds-hide');
                }
                this.isLoaded = true;
            })
            .catch(error => {
                this.message = error;
                this.isLoaded = true;
            });
    }
    
}