var names = ['Jacob','Ethan','Michael','Jayden','William','Alexander','Noah',
'Daniel','Aiden','Anthony','Joshua','Mason','Christopher','Andrew','David',
'Matthew','Logan','Elijah','James','Joseph','Gabriel','Benjamin','Ryan',
'Samuel','Jackson','John','Nathan','Jonathan','Christian','Liam','Dylan',
'Landon','Caleb','Tyler','Lucas','Evan','Gavin','Nicholas','Isaac','Brayden',
'Luke','Angel','Brandon','Jack','Isaiah','Jordan','Owen','Carter','Connor',
'Justin','Isabella','Sophia','Emma','Olivia','Ava','Emily','Abigail',
'Madison','Chloe','Mia','Addison','Elizabeth','Ella','Natalie','Samantha',
'Alexis','Lily','Grace','Hailey','Alyssa','Lillian','Hannah','Avery',
'Leah','Nevaeh','Sofia','Ashley','Anna','Brianna','Sarah','Zoe','Victoria',
'Gabriella','Brooklyn','Kaylee','Taylor','Layla','Allison','Evelyn','Riley',
'Amelia','Khloe','Makayla','Aubrey','Charlotte','Savannah','Zoey','Bella',
'Kayla','Alexa'];

module.exports.random = function() {
  var no = Math.floor ( Math.random() * names.length );
  return names[no];
}
