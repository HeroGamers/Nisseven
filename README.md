<h1 align="center">Project Nisseven</h1>

A "Nisseven" is a Danish tradition in schools. Every Christmas season, everyone in the class, who participates in the Nisseven Program, gets assigned a random "Nisseven".  
[Nisseven](https://github.com/HeroGamers/Nisseven) is a project all about easing the process of handling out "Nissevenner" to people, and will do so with ease, and with a stylish interface, with our focus on keeping everyones Nisseven a secret, by using a high level of security.

---

<div align="center">

[![Nisseven Icon](https://raw.githubusercontent.com/HeroGamers/Nisseven/master/public/images/nisseven-2.svg)](https://github.com/HeroGamers/Nisseven)
</div>

## Using Nisseven
Currently, Nisseven is only run locally, and has no publicly hosted version available.
You can however host it yourself, using the steps found further down!

## About Nisseven
The Nisseven Project is a project made for a Computer Science project.

### Presentation about Nisseven
If you wish to hold a presentation about Nisseven, there are presentation documents which you can use:
-  [Danish Presentation](https://raw.githubusercontent.com/HeroGamers/Nisseven/master/presentations/da_DK/Nisseven.pptx)

<div align="center">

[![Presentation Thumbnail](https://raw.githubusercontent.com/HeroGamers/Nisseven/master/presentations/PowerPointThumbnail.png)](https://raw.githubusercontent.com/HeroGamers/Nisseven/master/presentations/da_DK/Nisseven.pptx)
</div>

## Running Nisseven locally
1.  Clone the *master* branch of the Nisseven repository.
2.  Make sure to have [Node.js](https://nodejs.org/) installed on your machine.
3.  Run `npm install` in the Nisseven folder.
4.  After installing all the dependencies, make sure there's a valid SSL certificate inside of a directory named config/sslcert (project root -> config folder -> sslcert folder), and that the folder contains a valid `origin.pem` file, and a `privatekey.pem` file. If you don't have a SSL certificate, one can be [generated using OpenSSL](https://www.ibm.com/support/knowledgecenter/SSMNED_5.0.0/com.ibm.apic.cmc.doc/task_apionprem_gernerate_self_signed_openSSL.html).
5.  Run `npm run start` - The server should running now, and can be accessed through the HTTP and HTTPS ports on the machine where the webserver is running.
6.  Make any wanted changes to the `settings.json` file inside of the config directory, if wanted. Here you can customize the Admin profiles as well.
