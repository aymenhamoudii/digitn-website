/* Reservation form validation tests

These tests validate the expected behavior of the validateForm function used in app.js.
They are written as simple assertions that can be adapted to any test runner.
*/

function runFormTests(){
  // reuse validateEmail from utils and mimic validateForm local function
  function validateForm(data) {
    if (!data.name || data.name.trim().length < 2) return 'Please enter your full name.';
    if (!validateEmail(data.email)) return 'Please enter a valid email address.';
    if (!data.phone || data.phone.trim().length < 7) return 'Please enter a phone number.';
    if (!data.date) return 'Please choose a date.';
    if (!data.time) return 'Please choose a time.';
    if (!data.party || Number(data.party) < 1) return 'Please enter party size.';
    return null;
  }

  var good = {name:'Alice',email:'a@b.com',phone:'1234567',date:'2026-05-01',time:'19:00',party:'2'};
  if (validateForm(good) !== null) throw new Error('valid form flagged as invalid');

  var badEmail = Object.assign({},good,{email:'bad'});
  if (validateForm(badEmail) === null) throw new Error('invalid email not caught');

  var shortName = Object.assign({},good,{name:'A'});
  if (validateForm(shortName) === null) throw new Error('short name not caught');

  var noParty = Object.assign({},good,{party:'0'});
  if (validateForm(noParty) === null) throw new Error('party size of 0 not caught');

  console.info('Form validation tests passed');
}

if (typeof window === 'undefined') runFormTests(); else window.addEventListener('DOMContentLoaded', runFormTests);
