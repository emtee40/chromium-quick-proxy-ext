window.onload = function() {
	chrome.proxy.settings.get({ incognito: false }, function(config) {
		var googleList = ["*.google.com", "google.com", "googleusercontent.com", "*.googleusercontent.com", "*.gstatic.com", "gstatic.com"];
		var bypassList = [];
		var lastSetFunction = function() { };
		var inputs = document.getElementsByTagName("input");
		var setPreset = false;
		var parseUrl = function(url) {
			return { scheme: url.substring(0, url.indexOf(":")), host: url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf(":")), port: parseInt(url.substring(url.lastIndexOf(":") + 1)) };
		};
		var parseObject = function(obj) {
			return obj.scheme + "://" + obj.host + ":" + obj.port;
		};
		var closePopup = function() {
			window.close();
		};
		for (var i = 0; i < inputs.length; ++i) {
			if (inputs[i].name == "google") (function(self) {
				self.onclick = function() {
					bypassList = self.checked ? googleList : [];
					lastSetFunction.call(self);
				};
				
				if (config.value.rules.bypassList.length > 0) {
					self.checked = true;
					bypassList = googleList;
				}
			})(inputs[i]);
			else if (inputs[i].value == "system") (function(self) {
				var setIt = function() {
					chrome.proxy.settings.set({ value: { mode: "system" }, scope: "regular" }, closePopup);
					lastSetFunction = setIt;
				};
				self.onclick = setIt;

				if (config.value.mode == "system") {
					self.checked = true;
					lastSetFunction = setIt;
				}
			})(inputs[i]);
			else if (inputs[i].value == "direct") (function(self) {
				var setIt = function() {
					chrome.proxy.settings.set({ value: { mode: "direct" }, scope: "regular" }, closePopup);
					lastSetFunction = setIt;
				};
				self.onclick = setIt;

				if (config.value.mode == "direct") {
					self.checked = true;
					lastSetFunction = setIt;
				}
			})(inputs[i]);
			else if (inputs[i].value == "other") (function(self) {
				var other = document.getElementById("other");
				var setIt =  function() {
					chrome.proxy.settings.set({ value: { mode: "fixed_servers", rules:
						{ singleProxy: parseUrl(other.value), bypassList: bypassList } },
					scope: "regular" }, closePopup);
					lastSetFunction = setIt;
				};
				other.onblur = setIt;
				window.onunload = function() {
					if (self.checked)
						setIt.call(self);
				};
				other.onkeypress = function() {
					self.checked = true;
				};
				if (!setPreset && config.value.mode == "fixed_servers" && typeof config.value.rules.singleProxy != "undefined") {
					other.value = parseObject(config.value.rules.singleProxy);
					self.checked = true;
					lastSetFunction = setIt;
				}
			})(inputs[i]);
			else (function(self) {
				var setIt = function() {
					chrome.proxy.settings.set({ value: { mode: "fixed_servers", rules:
						{ singleProxy: parseUrl(self.value), bypassList: bypassList } },
					scope: "regular" }, closePopup);
					lastSetFunction = setIt;
				};
				self.onclick = setIt;
				if (config.value.mode == "fixed_servers" && typeof config.value.rules.singleProxy != "undefined" && self.value == parseObject(config.value.rules.singleProxy)) {
					self.checked = true;
					setPreset = true;
					lastSetFunction = setIt;
				}
			})(inputs[i]);
		}
	});
};
