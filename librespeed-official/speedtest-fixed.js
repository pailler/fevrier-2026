/*
	LibreSpeed - Main (Fixed Version)
	by Federico Dossena
	https://github.com/librespeed/speedtest/
	GNU LGPLv3 License
*/

function Speedtest() {
  this._serverList = [];
  this._selectedServer = null;
  this._settings = {};
  this._state = 0;
  this._worker = null;
  this._onupdate = null;
  this._onend = null;
  this._aborted = false;
  
  // Initialize default settings
  this._settings = {
    test_duration: 15,
    time_ul_max: 15,
    time_dl_max: 15,
    time_auto: true,
    count_ping: 10,
    time_ping: 1,
    time_jitter: 1,
    time_ul: 15,
    time_dl: 15,
    overhead_compensation: 1.06,
    telemetry_level: "basic",
    telemetry_extra: "",
    get_ip_isp_info: true,
    get_ip_isp_info_level: "basic"
  };
}

Speedtest.prototype.setParameter = function(param, value) {
  if (this._state === 0) {
    this._settings[param] = value;
    return true;
  }
  return false;
};

Speedtest.prototype.getState = function() {
  return this._state;
};

Speedtest.prototype.addTestPoint = function(server) {
  if (this._state === 0 || this._state === 1) {
    this._serverList.push(server);
    this._state = 1;
    return true;
  }
  return false;
};

Speedtest.prototype.addTestPoints = function(servers) {
  if (this._state === 0 || this._state === 1) {
    for (var i = 0; i < servers.length; i++) {
      this._serverList.push(servers[i]);
    }
    this._state = 1;
    return true;
  }
  return false;
};

Speedtest.prototype.selectServer = function(callback) {
  if (this._state !== 1) return false;
  
  var self = this;
  var bestServer = null;
  var bestPing = Infinity;
  var serversTested = 0;
  
  if (this._serverList.length === 0) {
    callback(null);
    return true;
  }
  
  var testServer = function(index) {
    if (index >= self._serverList.length) {
      self._selectedServer = bestServer;
      self._state = 2;
      callback(bestServer);
      return;
    }
    
    var server = self._serverList[index];
    var startTime = Date.now();
    
    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;
    xhr.open('GET', server.server + server.pingURL + '?t=' + startTime, true);
    
    xhr.onload = function() {
      var ping = Date.now() - startTime;
      server.pingT = ping;
      
      if (ping < bestPing) {
        bestPing = ping;
        bestServer = server;
      }
      
      serversTested++;
      if (serversTested === self._serverList.length) {
        self._selectedServer = bestServer;
        self._state = 2;
        callback(bestServer);
      } else {
        testServer(index + 1);
      }
    };
    
    xhr.onerror = function() {
      server.pingT = -1;
      serversTested++;
      if (serversTested === self._serverList.length) {
        self._selectedServer = bestServer;
        self._state = 2;
        callback(bestServer);
      } else {
        testServer(index + 1);
      }
    };
    
    xhr.ontimeout = function() {
      server.pingT = -1;
      serversTested++;
      if (serversTested === self._serverList.length) {
        self._selectedServer = bestServer;
        self._state = 2;
        callback(bestServer);
      } else {
        testServer(index + 1);
      }
    };
    
    xhr.send();
  };
  
  testServer(0);
  return true;
};

Speedtest.prototype.setSelectedServer = function(server) {
  if (this._state === 1) {
    this._selectedServer = server;
    this._state = 2;
    return true;
  }
  return false;
};

Speedtest.prototype.start = function() {
  if (this._state !== 2 && this._state !== 4) return false;
  
  this._aborted = false;
  this._state = 3;
  
  // Create worker
  this._worker = new Worker('speedtest_worker.js');
  
  var self = this;
  this._worker.onmessage = function(e) {
    if (self._onupdate) {
      self._onupdate(e.data);
    }
    
    if (e.data.testState === 4) {
      self._state = 4;
      if (self._onend) {
        self._onend(self._aborted);
      }
      self._worker.terminate();
      self._worker = null;
    }
  };
  
  // Start test
  var testData = {
    settings: this._settings,
    server: this._selectedServer
  };
  
  this._worker.postMessage(testData);
  return true;
};

Speedtest.prototype.abort = function() {
  if (this._state === 3) {
    this._aborted = true;
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
    this._state = 4;
    if (this._onend) {
      this._onend(true);
    }
    return true;
  }
  return false;
};

Speedtest.prototype.onupdate = function(callback) {
  this._onupdate = callback;
};

Speedtest.prototype.onend = function(callback) {
  this._onend = callback;
};

Speedtest.prototype.loadServerList = function(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        var servers = JSON.parse(xhr.responseText);
        callback(servers);
      } catch (e) {
        callback(null);
      }
    } else {
      callback(null);
    }
  };
  xhr.onerror = function() {
    callback(null);
  };
  xhr.send();
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Speedtest;
}









