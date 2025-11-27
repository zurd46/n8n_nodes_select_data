import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
	ILoadOptionsFunctions,
	IDataObject,
} from 'n8n-workflow';

// Helper functions
function getNestedValue(obj: IDataObject, path: string): unknown {
	const keys = path.split('.');
	let current: unknown = obj;

	for (const key of keys) {
		if (current === null || current === undefined) {
			return undefined;
		}
		current = (current as IDataObject)[key];
	}

	return current;
}

function setNestedValue(obj: IDataObject, path: string, value: unknown): void {
	const keys = path.split('.');
	let current = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!(key in current) || typeof current[key] !== 'object') {
			current[key] = {};
		}
		current = current[key] as IDataObject;
	}

	current[keys[keys.length - 1]] = value as IDataObject[keyof IDataObject];
}

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === '';
}

function deleteNestedField(obj: IDataObject, path: string): void {
	const keys = path.split('.');
	let current = obj;

	for (let j = 0; j < keys.length - 1; j++) {
		if (current[keys[j]] && typeof current[keys[j]] === 'object') {
			current = current[keys[j]] as IDataObject;
		} else {
			return;
		}
	}
	delete current[keys[keys.length - 1]];
}

export class SelectData implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Select Data',
		name: 'selectData',
		icon: 'fa:filter',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["mode"]}}',
		description: 'Visually select which fields to include in the output',
		defaults: {
			name: 'Select Data',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Mode',
				name: 'mode',
				type: 'options',
				options: [
					{
						name: 'Include Fields',
						value: 'include',
						description: 'Only selected fields will be included in the output',
					},
					{
						name: 'Exclude Fields',
						value: 'exclude',
						description: 'Selected fields will be removed from the output',
					},
					{
						name: 'Rename Fields',
						value: 'rename',
						description: 'Select and rename fields',
					},
					{
						name: 'Manual',
						value: 'manual',
						description: 'Manually enter field names',
					},
				],
				default: 'include',
				description: 'How should the fields be processed?',
			},
			// Include Mode
			{
				displayName: 'Fields to Keep',
				name: 'fieldsToInclude',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getInputFields',
				},
				default: [],
				displayOptions: {
					show: {
						mode: ['include'],
					},
				},
				description: 'Select the fields that should appear in the output',
			},
			// Exclude Mode
			{
				displayName: 'Fields to Remove',
				name: 'fieldsToExclude',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getInputFields',
				},
				default: [],
				displayOptions: {
					show: {
						mode: ['exclude'],
					},
				},
				description: 'Select the fields that should be removed from the output',
			},
			// Rename Mode
			{
				displayName: 'Rename Fields',
				name: 'renameFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: {},
				displayOptions: {
					show: {
						mode: ['rename'],
					},
				},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Source Field',
								name: 'sourceField',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getInputFields',
								},
								default: '',
								description: 'The field to be renamed',
							},
							{
								displayName: 'New Name',
								name: 'newName',
								type: 'string',
								default: '',
								description: 'The new name for the field',
							},
						],
					},
				],
				description: 'Select and rename fields',
			},
			// Manual Mode
			{
				displayName: 'Field Names (Comma-Separated)',
				name: 'manualFields',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						mode: ['manual'],
					},
				},
				placeholder: 'name, email, id',
				description: 'Enter field names manually, separated by comma',
			},
			{
				displayName: 'Manual Action',
				name: 'manualAction',
				type: 'options',
				options: [
					{
						name: 'Keep (Include)',
						value: 'include',
					},
					{
						name: 'Remove (Exclude)',
						value: 'exclude',
					},
				],
				default: 'include',
				displayOptions: {
					show: {
						mode: ['manual'],
					},
				},
				description: 'Should the fields be kept or removed?',
			},
			// Additional Options
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Remove Empty Fields',
						name: 'removeEmpty',
						type: 'boolean',
						default: false,
						description: 'Whether to remove fields that are null, undefined, or empty strings',
					},
					{
						displayName: 'Dot Notation',
						name: 'dotNotation',
						type: 'boolean',
						default: true,
						description: 'Whether to allow access to nested fields using dot notation (e.g. "user.name")',
					},
					{
						displayName: 'Top Level Only',
						name: 'topLevelOnly',
						type: 'boolean',
						default: false,
						description: 'Whether to only show first-level fields (ignores nested objects)',
					},
					{
						displayName: 'Split to Separate Items',
						name: 'splitToItems',
						type: 'boolean',
						default: false,
						description: 'Whether to split array values or newline-separated strings into separate output items',
					},
					{
						displayName: 'Split Separator',
						name: 'splitSeparator',
						type: 'string',
						default: '\\n',
						description: 'Separator to split string values (e.g. "\\n" for newlines, "," for commas). Only used when Split to Items is enabled and value is a string.',
						displayOptions: {
							show: {
								splitToItems: [true],
							},
						},
					},
					{
						displayName: 'Split Field Name',
						name: 'splitFieldName',
						type: 'string',
						default: 'value',
						description: 'Name of the field for each split item in the output',
						displayOptions: {
							show: {
								splitToItems: [true],
							},
						},
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getInputFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const options: INodePropertyOptions[] = [];

				try {
					// Use getCurrentNodeParameter to get previously executed data
					const currentData = this.getCurrentNodeParameter('fieldsToInclude') as string[] | undefined;
					if (currentData && currentData.length > 0) {
						for (const field of currentData) {
							if (field) {
								options.push({
									name: field,
									value: field,
								});
							}
						}
					}
				} catch {
					// Ignore errors
				}

				if (options.length === 0) {
					options.push({
						name: '-- Execute workflow to load fields --',
						value: '',
					});
				}

				return options;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const mode = this.getNodeParameter('mode', 0) as string;
		const options = this.getNodeParameter('options', 0, {}) as IDataObject;
		const removeEmpty = options.removeEmpty as boolean || false;
		const dotNotation = options.dotNotation as boolean ?? true;
		const splitToItems = options.splitToItems as boolean || false;
		const splitSeparator = (options.splitSeparator as string || '\\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
		const splitFieldName = options.splitFieldName as string || 'value';

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			let newJson: IDataObject = {};

			if (mode === 'include') {
				const fieldsToInclude = this.getNodeParameter('fieldsToInclude', i, []) as string[];

				for (const field of fieldsToInclude) {
					if (!field) continue;

					if (dotNotation && field.includes('.')) {
						const value = getNestedValue(item.json, field);
						setNestedValue(newJson, field, value);
					} else {
						newJson[field] = item.json[field];
					}
				}
			} else if (mode === 'exclude') {
				const fieldsToExclude = this.getNodeParameter('fieldsToExclude', i, []) as string[];
				newJson = JSON.parse(JSON.stringify(item.json));

				for (const field of fieldsToExclude) {
					if (!field) continue;

					if (dotNotation && field.includes('.')) {
						deleteNestedField(newJson, field);
					} else {
						delete newJson[field];
					}
				}
			} else if (mode === 'rename') {
				const renameFields = this.getNodeParameter('renameFields', i, {}) as IDataObject;
				const fieldMappings = (renameFields.field || []) as IDataObject[];

				newJson = JSON.parse(JSON.stringify(item.json));

				for (const mapping of fieldMappings) {
					const sourceField = mapping.sourceField as string;
					const newName = mapping.newName as string;

					if (!sourceField || !newName) continue;

					let value: unknown;
					if (dotNotation && sourceField.includes('.')) {
						value = getNestedValue(item.json, sourceField);
						deleteNestedField(newJson, sourceField);
					} else {
						value = item.json[sourceField];
						delete newJson[sourceField];
					}

					if (dotNotation && newName.includes('.')) {
						setNestedValue(newJson, newName, value);
					} else {
						newJson[newName] = value as IDataObject[keyof IDataObject];
					}
				}
			} else if (mode === 'manual') {
				const manualFields = this.getNodeParameter('manualFields', i, '') as string;
				const manualAction = this.getNodeParameter('manualAction', i, 'include') as string;
				const fields = manualFields.split(',').map(f => f.trim()).filter(f => f);

				if (manualAction === 'include') {
					for (const field of fields) {
						if (dotNotation && field.includes('.')) {
							const value = getNestedValue(item.json, field);
							setNestedValue(newJson, field, value);
						} else {
							newJson[field] = item.json[field];
						}
					}
				} else {
					newJson = JSON.parse(JSON.stringify(item.json));
					for (const field of fields) {
						if (dotNotation && field.includes('.')) {
							deleteNestedField(newJson, field);
						} else {
							delete newJson[field];
						}
					}
				}
			}

			// Remove empty fields if option is active
			if (removeEmpty) {
				const cleanObject = (obj: IDataObject): IDataObject => {
					const cleaned: IDataObject = {};
					for (const [key, value] of Object.entries(obj)) {
						if (!isEmpty(value)) {
							if (value && typeof value === 'object' && !Array.isArray(value)) {
								const cleanedNested = cleanObject(value as IDataObject);
								if (Object.keys(cleanedNested).length > 0) {
									cleaned[key] = cleanedNested;
								}
							} else {
								cleaned[key] = value;
							}
						}
					}
					return cleaned;
				};
				newJson = cleanObject(newJson);
			}

			// Split to separate items if option is active
			if (splitToItems) {
				// Find the first array or string value to split
				const allValues = Object.values(newJson);
				let valuesToSplit: unknown[] = [];

				// Check all fields for arrays or splittable strings
				for (const val of allValues) {
					if (Array.isArray(val)) {
						valuesToSplit = val;
						break;
					} else if (typeof val === 'string' && val.includes(splitSeparator)) {
						valuesToSplit = val.split(splitSeparator).map(s => s.trim()).filter(s => s);
						break;
					}
				}

				if (valuesToSplit.length > 0) {
					for (const splitValue of valuesToSplit) {
						const splitJson: IDataObject = {};
						splitJson[splitFieldName] = splitValue as IDataObject[keyof IDataObject];
						returnData.push({
							json: splitJson,
							pairedItem: { item: i },
						});
					}
				} else {
					// No splittable value found, return as-is
					returnData.push({
						json: newJson,
						pairedItem: { item: i },
					});
				}
			} else {
				returnData.push({
					json: newJson,
					pairedItem: { item: i },
				});
			}
		}

		return [returnData];
	}
}
