import App from '../App';

test('returns object', () => {
  expect(App.validateCoordinates('[51.83745, -31.48393]')).toEqual({ latitude: 51.83745, longitude: -31.48393 });
});

test('returns object 2', () => {
  expect(App.validateCoordinates('51.83745, -31.48393')).toEqual({ latitude: 51.83745, longitude: -31.48393 });
});

test('returns object 3', () => {
  expect(App.validateCoordinates('51.83745,-31.48393')).toEqual({ latitude: 51.83745, longitude: -31.48393 });
});

test('returns object 4', () => {
  expect(App.validateCoordinates('[51.83745,-31.48393]')).toEqual({ latitude: 51.83745, longitude: -31.48393 });
});

test('returns null', () => {
  expect(App.validateCoordinates('77.70234, -2.01d3')).toEqual(null);
});
