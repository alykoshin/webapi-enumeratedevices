/* global MediaStreamTrack */

'use strict';

if ( typeof module !== 'undefined' && typeof require !== 'undefined') {
  var debug   = require('mini-debug');
  var Emitter = require('mini-emitter.js');
}


var WebapiEnumerateDevices = function() {
  var self = this;
  Emitter(self);

  /** Media sources were fetched (possibly with error) and stored in appropriate lists (audioSources & videoSources) **/
  self.ready = false;

  /** Array to store raw info returned by browser **/
  self._devices = [];

  /** Standardized navigator.mediaDevices.enumerateDevices() API is available **/
  self._isMediaDevicesApi = function() {
    return (typeof navigator.mediaDevices !== 'undefined' || typeof navigator.mediaDevices.enumerateDevices === 'function');
  };

  /** Old Chrome MediaStreamTrack.getSources() API is available  **/
  self._isMediaStreamTrackApi = function() {
    return (typeof window.MediaStreamTrack !== 'undefined' && typeof window.MediaStreamTrack.getSources === 'function');
  };

  /** Media sources can be retrieved **/
  self.isAvailable = function() {
    return  self._isMediaDevicesApi() || self._isMediaStreamTrackApi();
  };

  /**
   * Callback for retrieve method
   *
   * @param devices
   */
  self._onSuccess = function(devices) {
    debug.log('WebapiMediaDevices._onSuccess()');

    self._devices = devices;
    self.ready = true;
    self.emit('_success', self._devices);
  };

  /**
   * retrieve MediaSources
   */
  self._getDevices = function() {
    debug.log('WebapiMediaDevices._getDevices()');
    self.sourceInfos = [];

    if ( self._isMediaStreamTrackApi() ) {
      self.ready = false;
      MediaStreamTrack.getSources( self._onSuccess );

    } else  if (self._isMediaDevicesApi() ) {
      self.ready = false;
      navigator.mediaDevices.enumerateDevices().then( self._onSuccess );

    } else {
      var msg = 'WebapiMediaDevices._getDevices(): Audio/Video Source selection is not possible:\n'+
        'nor _isMediaDevicesApi, nor _isMediaStreamTrackApi supported.';
      debug.error( msg );

      self.emit('_error', msg);
      self.ready = true;
    }
  };
};

if (typeof module !== 'undefined') {
  module.exports = WebapiEnumerateDevices;
}

if (typeof window !== 'undefined') {
  window.WebapiEnumerateDevices = WebapiEnumerateDevices;
}

