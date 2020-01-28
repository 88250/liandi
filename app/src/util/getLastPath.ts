export const getLastPath = (path:string) => {
    const paths = path.split('/');
    return paths[paths.length - 2];
};
