/*
UvumiTools Dropdown Menu v1.0.1 http://uvumi.com/tools/dropdown.html

Copyright (c) 2008 Uvumi LLC

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var UvumiDropdown=new Class({Implements:Options,options:{duration:250,transition:Fx.Transitions.linear},initialize:function(a,b){this.menu=a;this.setOptions(b);window.addEvent('domready',this.domReady.bind(this))},domReady:function(){this.menu=$(this.menu);if(!$defined(this.menu)){return false}if(this.menu.get('tag')!='ul'){this.menu=this.menu.getFirst('ul');if(!$defined(this.menu)){return false}}this.menu.setStyles({overflow:'hidden',height:0,marginLeft:(Browser.Engine.trident?1:-1)});this.createSubmenu(this.menu);this.menu.getChildren('li').setStyles({'float':'left',display:'block',top:0});var a=new Element('li',{html:"&nbsp;",styles:{clear:'both',display:(Browser.Engine.trident?'inline':'block'),position:'relative',top:0,height:0,width:0,fontSize:0,lineHeight:0,margin:0,padding:0}}).inject(this.menu);this.menu.setStyles({height:'auto',overflow:'visible',visibility:'visible'});this.menu.getElements('a').setStyle('display',(Browser.Engine.trident?'inline-block':'block'))},createSubmenu:function(c){var d=c.getChildren('li');var e=0;d.each(function(a){a.setStyles({position:'relative',display:'block',top:-e,zIndex:1});e+=a.getSize().y;var b=a.getFirst('ul');if($defined(b)){b.setStyle('display','none');if(c==this.menu){var x=0;var y=a.getSize().y;this.options.link='cancel';a.store('animation',new Fx.Elements($$(b,b.getChildren('li')).setStyle('opacity',0),this.options))}else{var x=a.getSize().x-a.getStyle('border-left-width').toInt();var y=-a.getStyle('border-bottom-width').toInt();this.options.link='chain';a.store('animation',new Fx.Elements($$(b,b.getChildren('li')).setStyle('opacity',0),this.options));e=a.getSize().y+a.getPosition(this.menu).y}b.setStyles({position:'absolute',display:'block',top:y,left:x,marginLeft:-x,opacity:0});this.createSubmenu(b);a.addEvents({mouseenter:this.showChildList.bind(this,a),mouseleave:this.hideChildList.bind(this,a)}).addClass('submenu')}},this)},showChildList:function(b){var c=b.getFirst('ul');var d=$$(c.getChildren('li'));var e=b.retrieve('animation');if(b.getParent('ul')!=this.menu){e.cancel();e.start({0:{opacity:1,marginLeft:0},1:{opacity:1}});var f={}}else{var f={0:{opacity:1}}}d.each(function(a,i){f[i+1]={top:0,opacity:1}});b.setStyle('z-index',99);e.start(f)},hideChildList:function(b){var c=b.retrieve('animation');var d=b.getFirst('ul');var e=$$(d.getChildren('li'));var f=0;var g={};e.each(function(a,i){g[i+1]={top:-f,opacity:0};f+=a.getSize().y});b.setStyle('z-index',1);if(b.getParent('ul')!=this.menu){g[1]=null;c.cancel();c.start(g);c.start({0:{opacity:0,marginLeft:-d.getSize().x},1:{opacity:0}})}else{g[0]={opacity:0};c.start(g)}}});