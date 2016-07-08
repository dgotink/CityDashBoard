function createColorScheme(){
    var dict = {};
    dict['forground'] = {};
    dict['background'] = {};
    
    dict['background']['Antwerpen'] = 'none';
    dict['background']['Brussel'] = 'none';
    dict['background']['Leuven'] = 'none';
    dict['background']['temperature'] = 'none';
    dict['background']['pressure'] = 'none';
    dict['background']['humidity'] = 'none';
    
    dict['forground']['Antwerpen'] = '#247BA0';
    dict['forground']['Brussel'] = '#70C1B3';
    dict['forground']['Leuven'] = '#F25F5C';
    dict['forground']['temperature'] = '#247BA0';
    dict['forground']['pressure'] = '#70C1B3';
    dict['forground']['humidity'] = '#B2DBBF';

    return dict;
}