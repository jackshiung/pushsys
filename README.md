# How to build development environment  

## 1. Clone projects
```bash
git clone git@github.com:jj-mms/jj-mms.git
```

## 2. Set env

1. Create `.env` file
2. Set env attributes, you can reference `template.env` file


## 3. Install node_modules && build
```bash
# install by package-lock.json modules
npm ci

# use in build backend & frontend
npm run build

# only build frontend
npm run frontend-build
```

## 4. Start with backend service
```bash
npm start
```


## 5. Access to url 

http://localhost:8080/management/