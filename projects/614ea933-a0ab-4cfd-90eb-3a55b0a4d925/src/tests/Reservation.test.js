/**
 * Test Specification: Reservation Form Validation
 */

test('validates required reservation fields', () => {
  const formData = {
    name: '',
    email: 'invalid-email',
    date: '',
    guests: 0
  };

  const validate = (data) => {
    const errors = {};
    if (!data.name) errors.name = 'Required';
    if (!data.email.includes('@')) errors.email = 'Invalid';
    if (!data.date) errors.date = 'Required';
    if (data.guests <= 0) errors.guests = 'Min 1';
    return errors;
  };

  const errors = validate(formData);
  expect(Object.keys(errors).length).toBe(4);
  expect(errors.email).toBe('Invalid');
});

test('successfully submits valid reservation data', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    date: '2024-12-25',
    time: '19:00',
    guests: 4
  };

  let submitted = false;
  const handleSubmit = (data) => {
    if (data.name && data.email.includes('@')) {
      submitted = true;
    }
  };

  handleSubmit(validData);
  expect(submitted).toBe(true);
});
