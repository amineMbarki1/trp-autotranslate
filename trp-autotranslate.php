<?php

/**
 * Plugin Name: Translatepress autotranslate
 */

function enqueue_assets()
{

    if (!strpos($_SERVER['REQUEST_URI'], 'trp-edit')) return;
    wp_enqueue_style(
        'trp-autotranslate-style',
        plugin_dir_url(__FILE__) . 'css/style.css',
        array(),
        '1.0.0',
        'all'
    );
    // wp_enqueue_script_module(
    //     'trp-autotranslate-worker',
    //     plugin_dir_url(__FILE__) . 'js/worker.js',
    //     array(),
    //     '1.0.0',
    // );

    wp_enqueue_script_module(
        'trp-autotranslate-script',
        plugin_dir_url(__FILE__) . 'js/main.js',
        array(),
        '1.0.0',
    );
}

add_action('wp_enqueue_scripts', 'enqueue_assets');



function handle_get_languages()
{
    $languages = trp_get_languages();
    wp_send_json($languages);
    wp_die();
}


add_action('wp_ajax_get_languages', "handle_get_languages");
