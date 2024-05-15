import {
	describe,
	it,
} from 'node:test';
import assert from 'node:assert/strict';
import {
	IntermediaryCalculation,
	IntermediaryNumber,
	IntermediaryNumber_input_types,
	IntermediaryNumber_type_types,
} from '../../lib/IntermediaryNumber';
import Fraction from 'fraction.js';
import BigNumber from 'bignumber.js';
import {
	Numbers,
} from '../../lib/Numbers';
import {
	not_undefined,
} from '@satisfactory-clips-archive/docs.json.ts/assert/CustomAssert';

void describe('IntermediaryNumber', () => {
	void describe('create', () => {
		const data_sets:[
			IntermediaryNumber_input_types,
			IntermediaryNumber_type_types|undefined,
		][] = [
			[
				'1',
				'amount_string',
			],
			[
				'lolnope',
				undefined,
			],
			[
				new Fraction(1/3),
				'Fraction',
			],
			[
				new BigNumber('999999999999999999999999999999999'),
				'BigNumber',
			],
			[
				'0.13r',
				'Fraction',
			],
			[
				'0.1(3)',
				'Fraction',
			],
			[
				'0.1(23)',
				'Fraction',
			],
			[
				'0.1[3]',
				'Fraction',
			],
			[
				'0.1[23]',
				'Fraction',
			],
			[
				'0.1(3)r',
				'Fraction',
			],
			[
				'0.1(23)r',
				'Fraction',
			],
			[
				'0.1[3]r',
				'Fraction',
			],
			[
				'0.1[23]r',
				'Fraction',
			],
		];

		for (const data_set of data_sets) {
			const [input, expectation] = data_set;

			void it(
				`IntermediaryNumber.create(${
					input.toString()
				})${
					undefined === expectation
						? ' throws'
						: `.type === ${expectation}`
				}`,
				() => {
					const get_value = () => IntermediaryNumber.create(input);

					if (undefined === expectation) {
						assert.throws(get_value);
					} else {
						assert.strictEqual(
							get_value().type,
							expectation
						);
					}
				}
			)
		}
	})
});

void describe('IntermediaryCalculation', () => {
	void it ('does a better job of handling things than native', () => {
		assert.notStrictEqual(
			(0.8 - 0.1).toFixed(16),
			'0.7'
		);
		assert.strictEqual(
			IntermediaryNumber.create(0.8).minus(0.1).toString(),
			'0.7'
		);
		assert.notStrictEqual(
			BigNumber(Numbers.amount_string('0.333333')).times(3).toString(),
			'1'
		),
		assert.strictEqual(
			IntermediaryNumber.create('0.3r').times(3).toString(),
			'1'
		);
	});

	void describe('fromString', () => {
		function random_ignore_string()
		{
			const length = Math.max(1, Math.min(100, Math.round(Math.random() * 100)));

			let result = '';

			for (let index = 0; index < length; ++index) {
				result += Math.random() > .5 ? '\t': ' ';
			}

			return result;
		}

		type data_set = [
			string,
			'IntermediaryNumber'|'IntermediaryCalculation'|undefined,
			string|undefined,
			string|undefined,
		];

		function expand_fraction_string(
			fraction_string:`${number}.${number}(${number})`
		): [data_set, ...data_set[]] {
			return [
				[
					fraction_string,
					'IntermediaryNumber',
					'Fraction',
					fraction_string,
				],
				[
					`${fraction_string}r`,
					'IntermediaryNumber',
					'Fraction',
					fraction_string,
				],
				[
					fraction_string.replace('(', '[').replace(')', ']'),
					'IntermediaryNumber',
					'Fraction',
					fraction_string,
				],
				[
					`${fraction_string.replace('(', '[').replace(')', ']')}r`,
					'IntermediaryNumber',
					'Fraction',
					fraction_string,
				],
			];
		}

		const data_sets:data_set[] = [
			[
				'1',
				'IntermediaryNumber',
				'amount_string',
				'1',
			],
			[
				'1.2r',
				'IntermediaryNumber',
				'Fraction',
				'1.(2)',
			],
			...expand_fraction_string('1.1(23)'),
			[
				'1.1(23) + 1',
				'IntermediaryCalculation',
				'Fraction + amount_string',
				'2.1(23)',
			],
			[
				'1.1(23) + 1 + 2',
				'IntermediaryCalculation',
				'IntermediaryCalculation + amount_string',
				'4.1(23)',
			],
			[
				'1.1(23) + 1 * 2',
				'IntermediaryCalculation',
				'IntermediaryCalculation + amount_string',
				'3.1(23)',
			],
			[
				'(1.1(23) + 1) * 2',
				'IntermediaryCalculation',
				'IntermediaryCalculation * amount_string',
				'4.2(46)',
			],
		];

		for (const data_set_raw of data_sets) {
			const [
				raw_input_string,
				expected_result_type,
				expected_type_info,
				expected_result_string,
			] = data_set_raw;

			for (const input_string of [
				raw_input_string,
				`${random_ignore_string()}${raw_input_string}`,
				`${raw_input_string}${random_ignore_string()}`,
				`${random_ignore_string()}${raw_input_string}${random_ignore_string()}`,
			]) {
				void it (
					`IntermediaryCalculation.fromString(${input_string}) ${
						undefined === expected_result_type
							? 'throws'
							: 'behaves'
					}`,
					() => {
						const parsed = IntermediaryCalculation.parseString(
							input_string
						);

						const actual_result_type =
							parsed.result?.constructor.name;

						assert.strictEqual(
							actual_result_type,
							expected_result_type
						);

						let result:
							| IntermediaryCalculation
							| IntermediaryNumber
							| undefined;

						const get_result = (
						) => {
							result = IntermediaryCalculation.fromString(
								input_string
							)
						};

						if (undefined === expected_result_type) {
							assert.throws(get_result);
						} else {
							assert.doesNotThrow(get_result);
							not_undefined(result);
							assert.strictEqual(
								result.constructor.name,
								expected_result_type
							);
							const actual_type_info = (
								result instanceof IntermediaryNumber
									? result.type
									: `${result.left_type} ${result.operation} ${result.right_type}`
							);

							assert.strictEqual(
								actual_type_info,
								expected_type_info
							);

							assert.strictEqual(
								result.toString(),
								expected_result_string
							);
						}
					}
				)
			}
		}
	});
})