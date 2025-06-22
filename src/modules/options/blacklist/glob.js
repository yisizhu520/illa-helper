/**
 * There are some characters which have a special meaning in a glob pattern.
 * We need to escape them to make them "normal" characters.
 */
var _specials = [
  '\\',
  '/',
  '.',
  '*',
  '+',
  '?',
  '|',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '$',
  '^',
];
var _globToRegexp = function (glob) {
  var regexp = '';
  var i = 0;
  while (i < glob.length) {
    var c = glob[i++];
    switch (c) {
      case '*':
        regexp += '.*';
        break;
      case '?':
        regexp += '.';
        break;
      case '[':
        var cls = '';
        var lo = '';
        if (glob[i] === '!') {
          cls = '^';
          i++;
        }
        while (glob[i] !== ']' && glob[i]) {
          var c_ = glob[i++];
          if (c_ === '-') {
            if (glob[i] && lo) {
              cls += lo + '-' + glob[i++];
              lo = '';
            } else {
              cls += '\\-';
              lo = '';
            }
          } else {
            cls += c_;
            lo = c_;
          }
        }
        if (lo && lo !== '^') {
        }
        i++; // Closing brace
        regexp += '[' + cls + ']';
        break;
      case '\\':
        regexp += '\\' + glob[i++];
        break;
      default:
        if (_specials.indexOf(c) > -1) {
          regexp += '\\';
        }
        regexp += c;
        break;
    }
  }
  return new RegExp('^' + regexp + '$');
};

/**
 * The public interface
 */
var glob = {
  /**
   * Match a string against a glob pattern.
   * @param pattern The glob pattern to match against
   * @param string The string to match
   * @return true if the string matches the pattern, false if not.
   */
  match: function (pattern, string) {
    return _globToRegexp(pattern).test(string);
  },
};

export default glob;
