import document from 'global/document';
import * as setup from './setup';
import Component from './component';
import globalOptions from './global-options.js';
import Player from './player';
import plugin from './plugins.js';
import mergeOptions from '../../src/js/utils/merge-options.js';

import assign from 'object.assign';
import log from './utils/log.js';
import * as Dom from './utils/dom.js';
import * as browser from './utils/browser.js';
import extendsFn from './extends.js';
import merge from 'lodash-compat/object/merge';

// Include the built-in techs
import Html5 from './tech/html5.js';
import Flash from './tech/flash.js';

// HTML5 Element Shim for IE8
if (typeof HTMLVideoElement === 'undefined') {
  document.createElement('video');
  document.createElement('audio');
  document.createElement('track');
}

/** @module/Function videojs
  @requires `setup.js`
  @requires `component.js`
  @requires `global-options.js`
  @requires `player.js`
  @requires `plugins.js`
  @requires `utils/merge-options.js`
  Video.js is a web video player built from the ground up for an HTML5 world. It supports HTML5 and
  Flash video, as well as YouTube and Vimeo (through plugins). It supports video playback on
  desktops and mobile devices.
@spare details
  The `videojs` function can be used to initialize or retrieve a [Player](.Player).
  ```javascript
  var myPlayer = videojs ('my_video_id');
  ```
@spare `README.md`
  @load
    ../../README.md
@argument/String|Element id
  Video [Element]() or video [Element]() ID.
@argument/.Component.Options options
  @optional
  Options Object for configuration and plugin activation.
@argument/Function ready
  @optional
  Immediately [bind a listener](.Component#ready) to the new [Player](.Player).
@returns/.Player
  The selected [Player](.Player), or a newly initialized one.
*/
var videojs = function(id, options, ready){
  var tag; // Element of ID

  // Allow for element or ID to be passed in
  // String ID
  if (typeof id === 'string') {

    // Adjust for jQuery ID syntax
    if (id.indexOf('#') === 0) {
      id = id.slice(1);
    }

    // If a player instance has already been created for this ID return it.
    if (Player.players[id]) {

      // If options or ready funtion are passed, warn
      if (options) {
        log.warn(`Player "${id}" is already initialised. Options will not be applied.`);
      }

      if (ready) {
        Player.players[id].ready(ready);
      }

      return Player.players[id];

    // Otherwise get element for ID
    } else {
      tag = Dom.getEl(id);
    }

  // ID is a media element
  } else {
    tag = id;
  }

  // Check for a useable element
  if (!tag || !tag.nodeName) { // re: nodeName, could be a box div also
    throw new TypeError('The element or ID supplied is not valid. (videojs)'); // Returns
  }

  // Element may have a player attr referring to an already created player instance.
  // If not, set up a new player and return the instance.
  return tag['player'] || new Player(tag, options, ready);
};

// Run Auto-load players
// You have to wait at least once in case this script is loaded after your video in the DOM (weird behavior only with minified version)
setup.autoSetupTimeout(1, videojs);

/** @property/String VERSION
  Current software version, in [semver](https://github.com/npm/node-semver) format.
*/
videojs['VERSION'] = '__VERSION__';

/** @property/Function getGlobalOptions
  Get the global options object
@returns/.Component.Options
  The global options Object.
*/
videojs.getGlobalOptions = () => globalOptions;

/** @property/Function setGlobalOptions
  Set options that will apply to every player. Not that this will do a [deep merge]
  (.mergeOptions) with the new options, not overwrite the entire global options Object.
@argument/.Component.Options newOptions
  New configuration options to be [recursively merged](.mergeOptions) into the global configuration.
  All active [Components](.Component) will be updated.
@returns/.Component.Options
  The updated global options Object.
*/
videojs.setGlobalOptions = function(newOptions) {
  return mergeOptions(globalOptions, newOptions);
};

// Set CDN Version of swf
const MINOR_VERSION = '__VERSION_NO_PATCH__';
const ACCESS_PROTOCOL = ('https:' === document.location.protocol ? 'https://' : 'http://');

// The added (+) blocks the replace from changing this _VERSION_NO_PATCH_ string
if (MINOR_VERSION !== '__VERSION_'+'NO_PATCH__') {
  globalOptions['flash']['swf'] = `${ACCESS_PROTOCOL}vjs.zencdn.net/${MINOR_VERSION}/video-js.swf`;
}

/** @property/Function getPlayers
  Get an object with the currently created players, keyed by player ID
@returns/Object
  The created [Players](.Player).
*/
videojs.getPlayers = function() {
  return Player.players;
};

/** @property/Function getComponent
  Get a component class Object by name.
@argument/String name
  The class name to retrieve.
@returns/Function|undefined
  The [Component](.Component) class constructor [registered](.registerComponent) to the provided
  name.
*/
videojs.getComponent = Component.getComponent;

/** @property/Function registerComponent
  Register a component so it can referred to by name.
@argument/String name
  The class name of the new Component.
@argument/Function component
  The component class constructor to register.
@returns/Function
  The newly registered [Component](.Component) constructor is returned.
*/
videojs.registerComponent = Component.registerComponent;

// documented in utils/Browser
videojs.browser = browser;

/** @property/Function extends
  Subclass an existing class. Mimics ES6 subclassing with the `extends` keyword. For example:
  ```javascript
  // Create a basic javascript 'class'
  function Human (name){
    this.name = name;
  }

  // Create an instance method
  Human.prototype.getName = function(){
    alert(this.name);
  };

  // Subclass the existing class and change the name
  var JonesFamilyMember = videojs.extends (Human, {
    constructor: function(name) {
      Human.call (this, name + ' Jones');
    }
  });

  // Create an instance of the new sub class
  var johnJones = new JonesFamilyMember ('John');
  myInstance.getName(); // "John Jones"
  ```
@argument/Function
  The Class to extend.
@argument/Object
  An object including instace methods for the new class. If the property `constructor` is found it
  is used as the class' constructor Function.
@returns/function
  A new subclass constructor.
*/
videojs.extends = extendsFn;

/** @property/Function mergeOptions
  Destructively merge options Objects, recursing through plain Objects and overwriting all other
  types. For example:
  ```javascript
  var defaultOptions = {
    foo: true,
    bar: {
      a: true,
      b: [ 1, 2, 3 ]
    }
  };
  var newOptions = {
    foo: false,
    bar: {
      b: [ 4 ]
    }
  };
  videojs.mergeOptions (defaultOptions, newOptions);
  // defaultOptions.foo = false;
  // defaultOptions.bar.a = true;
  // defaultOptions.bar.b = [ 4 ];
  ```
@argument/.Component.Options target
  The options Object which will be filled/overwritten by `source`.
@args/.Component.Options source
  Any number of options Objects to be merged into `target`. Merge operations are processed
  individually in forward order.
@returns/Object
  Returns the `target` Object.
*/
videojs.mergeOptions = mergeOptions;

/** @property/Function plugin
  Register a Video.js [Player](.Player) Plugin to be activated on new and current [Player](.Player)
  instances. The plugin will only be activated when an option is found in the either [Component's
  config](.Component(options) or the [global config.](.setGlobalOptions)

  Some simple examples:
  ```javascript
  // register a plugin that alerts when the player starts playing
  videojs.plugin ('myPlugin', function (options) {
    options = options || {};
    var alertText = options.text || 'Player is playing!'
    this.on('play', function(){
      alert (alertText);
    });
  });

  // New player with plugin options pre-configured
  var playerOne = videojs ('idOne', {
    myPlugin: {
      text: 'Custom text!'
    }
  });

  // New player with plugin options configured later
  var playerTwo = videojs ('idOne');
  playerTwo.myPlugin ({ text:'Custom text!' });

  // New player with a late-registered plugin
  var playerThree = videojs ('idThree', {
    pluginTwo: {
      text: 'Pause text!'
    }
  });
  videojs.plugin ('pluginTwo', function (options) {
    options = options || {};
    var alertText = options.text || 'Player is paused!'
    this.on('pause', function(){
      alert (alertText);
    });
  });
  ```
@spare `authoring plugins`
  @load `../../docs/guides/plugins.md`
@argument/String
  The new plugin's name.
@argument/Function
  The plugin Function that will be called with the plugin's [configured options]
  (.Component(options).
*/
// shouldn't it be registerPlugin, to match registerComponent?
videojs.plugin = plugin;

/** @property/Function addLanguage
  Adding languages so that they're available to all players.
```javascript
videojs.addLanguage('es', { 'Hello': 'Hola' });
```
@argument/String code
  The language code or dictionary property.
@argument/Object data
  The data values to be translated.
@returns/Object
  The resulting language dictionary Object.
*/
videojs.addLanguage = function(code, data){
  code = ('' + code).toLowerCase();
  return merge(globalOptions.languages, { [code]: data })[code];
};

// REMOVING: We probably should add this to the migration plugin
// // Expose but deprecate the window[componentName] method for accessing components
// Object.getOwnPropertyNames(Component.components).forEach(function(name){
//   let component = Component.components[name];
//
//   // A deprecation warning as the constuctor
//   module.exports[name] = function(player, options, ready){
//     log.warn('Using videojs.'+name+' to access the '+name+' component has been deprecated. Please use videojs.getComponent("componentName")');
//
//     return new Component(player, options, ready);
//   };
//
//   // Allow the prototype and class methods to be accessible still this way
//   // Though anything that attempts to override class methods will no longer work
//   assign(module.exports[name], component);
// });

/**
 * Custom Universal Module Definition (UMD)
 *
 * Video.js will never be a non-browser lib so we can simplify UMD a bunch and
 * still support requirejs and browserify. This also needs to be closure
 * compiler compatible, so string keys are used.
 */
if (typeof define === 'function' && define['amd']) {
  define('videojs', [], function(){ return videojs; });

// checking that module is an object too because of umdjs/umd#35
} else if (typeof exports === 'object' && typeof module === 'object') {
  module['exports'] = videojs;
}

export default videojs;
